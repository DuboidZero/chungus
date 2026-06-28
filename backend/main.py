from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, profile, achievement, experience, project, skill

app = FastAPI(title="MIT WPU Portfolio System")

# CORS: allow the frontend (different server/domain) to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All API routes live under /api/v1 (per the contract)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(achievement.router, prefix="/api/v1")
app.include_router(experience.router, prefix="/api/v1")
app.include_router(project.router, prefix="/api/v1")
app.include_router(skill.router, prefix="/api/v1")


@app.get("/api/v1/health")
def health():
    from datetime import datetime, timezone
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}