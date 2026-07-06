from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin, get_current_user, get_db
from app.core.audit import log_action
from app.models.user import User
from app.models.phase6 import AuditLog, CoCurricular
from app.schemas.base import CamelModel

router = APIRouter(tags=["phase6"])


class BulkPromoteRequest(CamelModel):
    batch: str
    division_id: str | None = None
    exclude_prns: list[str] = Field(default_factory=list)
    max_semester: int = 8


class BulkPromoteResult(CamelModel):
    promoted: int
    skipped: int
    skipped_prns: list[str]


@router.post("/admin/bulk-promote", response_model=BulkPromoteResult)
async def bulk_promote(
    payload: BulkPromoteRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    q = db.query(User).filter(User.role == "student", User.batch == payload.batch)
    if payload.division_id:
        q = q.filter(User.division_id == payload.division_id)
    students = q.all()

    exclude = {p.strip() for p in payload.exclude_prns}
    promoted = 0
    skipped_prns = []

    for s in students:
        if s.prn in exclude:
            skipped_prns.append(s.prn)
            continue
        cur = s.current_semester or 0
        if cur >= payload.max_semester:
            skipped_prns.append(s.prn)
            continue
        s.current_semester = cur + 1
        promoted += 1

    db.commit()

    log_action(
        db, admin, action="bulk_promote",
        target_type="cohort",
        target_id=f"{payload.batch}/{payload.division_id or 'all'}",
        detail=f"Promoted {promoted}, skipped {len(skipped_prns)}. Excluded PRNs: {sorted(exclude)}",
    )

    return BulkPromoteResult(
        promoted=promoted, skipped=len(skipped_prns), skipped_prns=skipped_prns,
    )


class AuditLogResponse(CamelModel):
    id: str
    actor_email: str | None
    action: str
    target_type: str | None
    target_id: str | None
    detail: str | None
    created_at: object


@router.get("/admin/audit-logs", response_model=list[AuditLogResponse])
async def list_audit_logs(
    action: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    return q.order_by(AuditLog.created_at.desc()).limit(min(limit, 500)).all()


class CoCurricularCreate(CamelModel):
    organisation: str = Field(min_length=1, max_length=150)
    role: str | None = Field(default=None, max_length=100)
    activity_type: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=500)
    academic_year: str | None = Field(default=None, max_length=20)


class CoCurricularResponse(CamelModel):
    id: str
    organisation: str
    role: str | None
    activity_type: str | None
    description: str | None
    academic_year: str | None


@router.get("/co-curricular", response_model=list[CoCurricularResponse])
async def list_co_curricular(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    return db.query(CoCurricular).filter(CoCurricular.user_id == current.id).all()


@router.post("/co-curricular", response_model=CoCurricularResponse, status_code=201)
async def add_co_curricular(
    payload: CoCurricularCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    item = CoCurricular(user_id=current.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/co-curricular/{item_id}", status_code=204)
async def delete_co_curricular(
    item_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    item = db.query(CoCurricular).filter(
        CoCurricular.id == item_id, CoCurricular.user_id == current.id
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Not found or not yours")
    db.delete(item)
    db.commit()