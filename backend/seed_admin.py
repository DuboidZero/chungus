from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()

existing = db.query(User).filter(User.email == "admin@mitwpu.edu.in").first()
if existing:
    print("Admin already exists.")
else:
    admin = User(
        role="admin",
        email="admin@mitwpu.edu.in",
        hashed_password=hash_password("admin123"),
        must_change_password=False,
    )
    db.add(admin)
    db.commit()
    print("Admin created. Email: admin@mitwpu.edu.in, password: admin123")

db.close()