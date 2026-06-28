from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

# A session factory: each request gets its own short-lived "conversation" with the DB
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

# Base: the parent class every model (table) will inherit from
Base = declarative_base()