from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
import jwt

from app.core.database import SessionLocal
from app.models.user import User

SECRET_KEY = "retailpulse123"
ALGORITHM = "HS256"

router = APIRouter(prefix="/profile", tags=["Profile"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_profile(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    email = payload["email"]

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "company": user.company_name,
        "last_login": user.last_login,
        "account_status": user.status,
    }