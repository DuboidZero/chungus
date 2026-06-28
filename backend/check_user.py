from app.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()
user = db.query(User).filter(User.prn == "1032210001").first()

print("User found:", user is not None)
print("must_change_password:", user.must_change_password)
print("Does 'Sai12345' match?:", verify_password("Sai12345", user.hashed_password))
print("Does 'rahu2004' match?:", verify_password("rahu2004", user.hashed_password))

db.close()