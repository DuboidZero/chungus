from io import BytesIO

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from openpyxl import load_workbook

from app.models.user import User
from app.schemas.admin import BulkUploadResult, SeededStudent
from app.core.dependencies import get_current_admin, get_db
from app.core.security import hash_password, generate_initial_password

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/students/upload", response_model=BulkUploadResult)
async def bulk_upload_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    # 1. Read the uploaded file into memory
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

    # 2. Loop rows (skip header row 1). Expected columns:
    #    A=PRN  B=Full Name  C=Year of Birth  D=Batch  E=Branch
    for row_num, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        if row is None or all(cell is None for cell in row):
            continue  # skip blank rows

        prn, full_name, year_of_birth, batch, branch = (list(row) + [None] * 5)[:5]

        # 3. Validate required fields
        if not prn or not full_name or not year_of_birth:
            errors.append(f"Row {row_num}: missing PRN, name, or year of birth")
            continue

        prn = str(prn).strip()

        # 4. Skip duplicates
        if db.query(User).filter(User.prn == prn).first():
            skipped += 1
            continue

        # 5. Create the student account
        try:
            year = int(year_of_birth)
            initial_password = generate_initial_password(str(full_name), year)
            user = User(
                role="student",
                prn=prn,
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