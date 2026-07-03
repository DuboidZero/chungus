import uuid
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routes import auth, profile, achievement, experience, project, skill, academic, dashboard, admin, teacher, upload

app = FastAPI(title="MIT WPU Portfolio System")

# CORS: allow the frontend (different server/domain) to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
#  Global error handlers — reshape all errors to the contract:
#  { detail, code, requestId, errors }
# ============================================================
_CODE_MAP = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    500: "INTERNAL_ERROR",
}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": _CODE_MAP.get(exc.status_code, "ERROR"),
            "requestId": str(uuid.uuid4()),
            "errors": [],
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"field": ".".join(str(p) for p in e["loc"] if p != "body"), "message": e["msg"]}
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation failed",
            "code": "VALIDATION_ERROR",
            "requestId": str(uuid.uuid4()),
            "errors": errors,
        },
    )


# ============================================================
#  Routes — all under /api/v1 (per the contract)
# ============================================================
app.include_router(auth.router, prefix="/api/v1")
app.include_router(auth.me_router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(achievement.router, prefix="/api/v1")
app.include_router(experience.router, prefix="/api/v1")
app.include_router(project.router, prefix="/api/v1")
app.include_router(skill.router, prefix="/api/v1")
app.include_router(academic.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(teacher.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")


@app.get("/api/v1/health")
def health():
    from datetime import datetime, timezone
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}