from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.dependencies import get_current_admin, get_db
from app.models.user import User
from app.models.academic_structure import Branch, Division, Domain, Course, CourseDomain
from app.schemas.academic_structure import (
    BranchCreate, BranchUpdate, BranchResponse,
    DivisionCreate, DivisionUpdate, DivisionResponse,
    DomainCreate, DomainUpdate, DomainResponse,
    CourseCreate, CourseUpdate, CourseResponse, CourseDomainResponse,
)

router = APIRouter(prefix="/admin/academic-structure", tags=["academic-structure"])


def _commit_or_conflict(db: Session, detail: str):
    """Shared helper: commit, and translate a UNIQUE constraint violation into a 409
    instead of letting a raw IntegrityError bubble up as a 500."""
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


# ============================================================
#  Branch
# ============================================================
@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
async def create_branch(
    payload: BranchCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    branch = Branch(name=payload.name, code=payload.code)
    db.add(branch)
    _commit_or_conflict(db, "A branch with that name or code already exists")
    db.refresh(branch)
    return branch


@router.get("/branches", response_model=list[BranchResponse])
async def list_branches(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(Branch).order_by(Branch.name).all()


@router.patch("/branches/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: str,
    payload: BranchUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(branch, field, value)
    _commit_or_conflict(db, "A branch with that name or code already exists")
    db.refresh(branch)
    return branch


@router.delete("/branches/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(
    branch_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    if db.query(Division).filter(Division.branch_id == branch_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a branch that still has divisions. Delete or reassign its divisions first.",
        )
    if db.query(Course).filter(Course.branch_id == branch_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a branch that still has courses. Delete or reassign its courses first.",
        )
    db.delete(branch)
    db.commit()


# ============================================================
#  Division
# ============================================================
@router.post("/divisions", response_model=DivisionResponse, status_code=status.HTTP_201_CREATED)
async def create_division(
    payload: DivisionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not db.query(Branch).filter(Branch.id == payload.branch_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    division = Division(branch_id=payload.branch_id, name=payload.name)
    db.add(division)
    _commit_or_conflict(db, "That division already exists for this branch")
    db.refresh(division)
    return division


@router.get("/divisions", response_model=list[DivisionResponse])
async def list_divisions(
    branch_id: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(Division)
    if branch_id:
        query = query.filter(Division.branch_id == branch_id)
    return query.order_by(Division.name).all()


@router.patch("/divisions/{division_id}", response_model=DivisionResponse)
async def update_division(
    division_id: str,
    payload: DivisionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    division = db.query(Division).filter(Division.id == division_id).first()
    if division is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Division not found")
    data = payload.model_dump(exclude_unset=True)
    if "branch_id" in data and not db.query(Branch).filter(Branch.id == data["branch_id"]).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    for field, value in data.items():
        setattr(division, field, value)
    _commit_or_conflict(db, "That division already exists for this branch")
    db.refresh(division)
    return division


@router.delete("/divisions/{division_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_division(
    division_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    division = db.query(Division).filter(Division.id == division_id).first()
    if division is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Division not found")
    if db.query(User).filter(User.division_id == division_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a division that still has students assigned to it.",
        )
    db.delete(division)
    db.commit()


# ============================================================
#  Domain
# ============================================================
@router.post("/domains", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
async def create_domain(
    payload: DomainCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    domain = Domain(name=payload.name, description=payload.description)
    db.add(domain)
    _commit_or_conflict(db, "A domain with that name already exists")
    db.refresh(domain)
    return domain


@router.get("/domains", response_model=list[DomainResponse])
async def list_domains(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(Domain).order_by(Domain.name).all()


@router.patch("/domains/{domain_id}", response_model=DomainResponse)
async def update_domain(
    domain_id: str,
    payload: DomainUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if domain is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(domain, field, value)
    _commit_or_conflict(db, "A domain with that name already exists")
    db.refresh(domain)
    return domain


@router.delete("/domains/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(
    domain_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if domain is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    if db.query(CourseDomain).filter(CourseDomain.domain_id == domain_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a domain that is still mapped to courses.",
        )
    db.delete(domain)
    db.commit()


# ============================================================
#  Course (+ domain mappings)
# ============================================================
@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not db.query(Branch).filter(Branch.id == payload.branch_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    for link in payload.domains:
        if not db.query(Domain).filter(Domain.id == link.domain_id).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Domain {link.domain_id} not found")

    course = Course(
        branch_id=payload.branch_id,
        semester=payload.semester,
        course_code=payload.course_code,
        course_name=payload.course_name,
        type=payload.type,
        credits=payload.credits,
    )
    db.add(course)
    try:
        db.flush()   # get course.id without committing yet, so domain links land in the same transaction
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That course code already exists for this branch")

    for link in payload.domains:
        db.add(CourseDomain(course_id=course.id, domain_id=link.domain_id, weight=link.weight))

    _commit_or_conflict(db, "Duplicate domain mapping for this course")
    db.refresh(course)
    return course


@router.get("/courses", response_model=list[CourseResponse])
async def list_courses(
    branch_id: str | None = None,
    semester: int | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(Course)
    if branch_id:
        query = query.filter(Course.branch_id == branch_id)
    if semester:
        query = query.filter(Course.semester == semester)
    return query.order_by(Course.semester, Course.course_code).all()


@router.get("/courses/{course_id}/domains", response_model=list[CourseDomainResponse])
async def list_course_domains(
    course_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not db.query(Course).filter(Course.id == course_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return db.query(CourseDomain).filter(CourseDomain.course_id == course_id).all()


@router.patch("/courses/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    data = payload.model_dump(exclude_unset=True)
    if "branch_id" in data and not db.query(Branch).filter(Branch.id == data["branch_id"]).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    for field, value in data.items():
        setattr(course, field, value)
    _commit_or_conflict(db, "That course code already exists for this branch")
    db.refresh(course)
    return course


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    db.query(CourseDomain).filter(CourseDomain.course_id == course_id).delete()
    db.delete(course)
    db.commit()