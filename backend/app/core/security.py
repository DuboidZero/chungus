import bcrypt
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv



def hash_password(plain_password: str) -> str:
    """Scramble a password for safe storage. One-way: can't be reversed."""
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a typed password against the stored hash. Returns True if they match."""
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict) -> str:
    """Mint a signed JWT token carrying the given data + an expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Read + verify a JWT. Returns the data inside if valid, None if not."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_initial_password(full_name: str, year_of_birth: int) -> str:
    """SRS 3.1.2: first 4 letters of name (lowercase) + year of birth.
    'Rahul Sharma' born 2004 -> 'rahu2004'. If name < 4 letters, use whole name."""
    letters = "".join(c for c in full_name if c.isalpha()).lower()
    prefix = letters[:4] if len(letters) >= 4 else letters
    return f"{prefix}{year_of_birth}"