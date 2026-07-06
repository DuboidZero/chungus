"""Helper to write audit-log entries (Phase 6)."""
from sqlalchemy.orm import Session
from app.models.phase6 import AuditLog


def log_action(db: Session, actor, action: str,
               target_type: str = None, target_id: str = None, detail: str = None,
               commit: bool = True):
    entry = AuditLog(
        actor_id=getattr(actor, "id", None),
        actor_email=getattr(actor, "email", None),
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
    )
    db.add(entry)
    if commit:
        db.commit()
    return entry