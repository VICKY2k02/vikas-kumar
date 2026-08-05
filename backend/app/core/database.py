from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.orm import Session
import os





DATABASE_URL = "sqlite:///./retailpulse.db"
# DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/retailpulse"

# engine = create_engine(
#     DATABASE_URL,
#     connect_args={"check_same_thread": False}
# )
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 30
    }
)

print("DB FILE:", os.path.abspath("retailpulse.db"))
print("ENGINE:", engine.url)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()