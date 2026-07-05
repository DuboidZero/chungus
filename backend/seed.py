"""
Seed script — creates the initial admin account.
Run after a fresh DB setup:  python seed.py
Safe to run repeatedly (skips if the admin already exists).
"""
from app.database import SessionLocal
from app.core.security import hash_password
import app.models          # registers ALL tables via __init__.py
from app.models.user import User

ADMIN_EMAIL = "admin@mitwpu.edu.in"
ADMIN_PASSWORD = "admin123"   # change after first login in production
ADMIN_NAME = "System Admin"


def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"Admin already exists: {ADMIN_EMAIL}")
            return
        admin = User(
            role="admin",
            email=ADMIN_EMAIL,
            name=ADMIN_NAME,
            hashed_password=hash_password(ADMIN_PASSWORD),
            must_change_password=False,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Admin created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()