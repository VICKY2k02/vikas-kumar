from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
    
):
    print("=" * 50)
    print("SERVER UTC :", datetime.utcnow())
    print("TOKEN :", token)


    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Token"
    )

    try:

     

        print("SECRET_KEY:", SECRET_KEY)
        print("ALGORITHM:", ALGORITHM)

        claims = jwt.get_unverified_claims(token)
        print("UNVERIFIED CLAIMS:", claims)

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_exp": False
            }
        )

        print("DECODED:", payload)

        print("TOKEN EXP :", payload["exp"])
        print("CURRENT TIMESTAMP :", int(datetime.utcnow().timestamp()))
        print("=" * 50)

        user_id = payload.get("user_id")

        print("USER ID:", user_id)

        if user_id is None:
            raise credentials_exception

        print("PAYLOAD:", payload)

    except ExpiredSignatureError:
        print("TOKEN EXPIRED")
        raise HTTPException(status_code=401, detail="Expired Token")

    except JWTError as e:
        print("JWT ERROR:", e)
        raise credentials_exception

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    print("USER:", user)

    if not user:
        raise credentials_exception

    return user




def require_roles(*roles):

    def role_checker(current_user=Depends(get_current_user)):

        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Permission Denied"
            )

        return current_user

    return role_checker