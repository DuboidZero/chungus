from io import BytesIO

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from openpyxl import load_workbook

from app.models.user import User
from app.models.academic import Semester, Subject
from app.schemas.admin import BulkUploadResult, SeededStudent, TeacherCreate, UserSummary
from app.core.dependencies import get_current_admin, get_db
from app.core.security import hash_password, generate_initial_password

router = APIRouter(prefix="/admin", tags=["admin"])


# ============================================================
#  Bulk student account upload
#  Columns: A=PRN  B=Full Name  C=Year of Birth  D=Batch  E=Branch
# ============================================================
@router.post("/students/upload", response_model=BulkUploadResult)
async def bulk_upload_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    contents = await file.read()
    try:
        workbook = load_workbook(BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Excel file")

    sheet = workbook.active

    created = 0
    skipped = 0
    errors = []
    seeded_students = []

    for row_num, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        if row is None or all(cell is None for cell in row):
            continue

        prn, full_name, year_of_birth, batch, branch = (list(row) + [None] * 5)[:5]

        if not prn or not full_name or not year_of_birth:
            errors.append(f"Row {row_num}: missing PRN, name, or year of birth")
            continue

        prn = str(prn).strip()

        if db.query(User).filter(User.prn == prn).first():
            skipped += 1
            continue

        try:
            year = int(year_of_birth)
            initial_password = generate_initial_password(str(full_name), year)
            user = User(
                role="student",
                prn=prn,
                name=str(full_name),
                department=str(branch) if branch else None,
                hashed_password=hash_password(initial_password),
                must_change_password=True,
            )
            db.add(user)
            created += 1
            seeded_students.append(SeededStudent(
                prn=prn,
                full_name=str(full_name),
                initial_password=initial_password,
            ))
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")

    db.commit()

    return BulkUploadResult(
        created=created,
        skipped=skipped,
        errors=errors,
        students=seeded_students,
    )


# ============================================================
#  Bulk marks upload (one row per subject)
#  Columns: A=PRN  B=Semester  C=Subject  D=Obtained  E=Max  F=Credits
#  GPA/CGPA are computed from these marks by the grading code.
# ============================================================
@router.post("/marks/upload", response_model=dict)
async def bulk_upload_marks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    contents = await file.read()
    try:
        workbook = load_workbook(BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Excel file")

    sheet = workbook.active
    subjects_added = 0
    errors = []
    semester_cache = {}  # (user_id, semester_number) -> Semester

    for row_num, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        if row is None or all(cell is None for cell in row):
            continue

        prn, semester_number, subject_name, obtained, max_marks, credits = (list(row) + [None] * 6)[:6]

        if not prn or not semester_number or not subject_name:
            errors.append(f"Row {row_num}: missing PRN, semester, or subject")
            continue

        prn = str(prn).strip()
        student = db.query(User).filter(User.prn == prn, User.role == "student").first()
        if not student:
            errors.append(f"Row {row_num}: no student with PRN {prn}")
            continue

        try:
            sem_num = int(semester_number)
            cache_key = (student.id, sem_num)

            if cache_key in semester_cache:
                semester = semester_cache[cache_key]
            else:
                semester = db.query(Semester).filter(
                    Semester.user_id == student.id,
                    Semester.semester_number == sem_num,
                ).first()
                if not semester:
                    semester = Semester(user_id=student.id, semester_number=sem_num)
                    db.add(semester)
                    db.flush()
                semester_cache[cache_key] = semester

            db.add(Subject(
                semester_id=semester.id,
                name=str(subject_name),
                marks_obtained=float(obtained) if obtained is not None else None,
                max_marks=float(max_marks) if max_marks is not None else None,
                grade=None,  # derived from marks % by the grading calculator
                credits=int(credits) if credits else 0,
            ))
            subjects_added += 1
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")

    db.commit()
    return {"subjectsAdded": subjects_added, "errors": errors}


# ============================================================
#  Teacher account creation
# ============================================================
@router.post("/teachers", response_model=UserSummary, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    payload: TeacherCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    teacher = User(
        role="teacher",
        email=payload.email,
        name=payload.full_name,
        hashed_password=hash_password(payload.password),
        must_change_password=True,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


# ============================================================
#  Account management: list users + activate/deactivate
# ============================================================
@router.get("/users", response_model=list[UserSummary])
async def list_users(
    role: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()


@router.patch("/users/{user_id}/active", response_model=UserSummary)
async def set_user_active(
    user_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user