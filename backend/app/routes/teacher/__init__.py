from fastapi import APIRouter
from . import views, records, guidance, dashboard

router = APIRouter(prefix="/teacher", tags=["teacher"])
router.include_router(views.router)
router.include_router(records.router)
router.include_router(guidance.router)
router.include_router(dashboard.router)