from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth_schema import CompanyRegister
from app.services.auth_service import register_company
from app.core.database import get_db


from app.schemas.auth_schema import LoginSchema
from app.services.auth_service import login_user

from app.core.dependencies import get_current_user
from app.services.auth_service import logout_user

from app.schemas.auth_schema import RefreshSchema
from app.services.auth_service import refresh_access_token


from app.schemas.auth_schema import ForgotPasswordSchema
from app.schemas.auth_schema import ResetPasswordSchema

from app.services.auth_service import forgot_password
from app.services.auth_service import reset_password
from app.models.user import User


from app.schemas.auth_schema import UserRegisterSchema
from app.services.auth_service import register_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/register-company")
def register(
    request: Request,
    data: CompanyRegister,
    db: Session = Depends(get_db)
):

    return register_company(
        db,
        data,
        request
    )


@router.get("/health")
def health():

    return {
        "message": "Authentication Ready"
    }


@router.post("/login")
def login(
    request: Request,
    data: LoginSchema,
    db: Session = Depends(get_db)
):

    return login_user(
        db,
        data,
        request
    )


 

@router.post("/logout")
def logout(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return logout_user(
        db=db,
        current_user=current_user,
        request=request
    )

@router.post("/refresh")
def refresh(
    data: RefreshSchema,
    db: Session = Depends(get_db)
):

    return refresh_access_token(
        db,
        data.refresh_token
    )


@router.post("/forgot-password")
def forgot(

    data: ForgotPasswordSchema,

    db: Session = Depends(get_db)

):

    return forgot_password(
        db,
        data
    )


@router.post("/reset-password")
def reset(
    request: Request,

    data: ResetPasswordSchema,

    db: Session = Depends(get_db)

):

    return reset_password(
        db,
        data,
        request
    )




@router.post("/register-user")
def register_new_user(
    data: UserRegisterSchema,
    db: Session = Depends(get_db)
):

    # ----------------------------
    # Role Validation
    # ----------------------------
    allowed_roles = [
        "Super Admin",
        "Company Admin",
        "Analyst",
        "User"
    ]

    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid Role"
        )

    return register_user(
        db,
        data
    )



