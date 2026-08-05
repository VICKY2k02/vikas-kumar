from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.audit_service import get_browser

from fastapi import HTTPException
from app.models.company import Company

from app.models.user import User

from app.schemas.auth_schema import CompanyRegister

from app.core.security import hash_password

from datetime import datetime, timedelta

from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token
)

from app.core.security import hash_password

from jose import jwt

from app.core.security import (
    SECRET_KEY,
    ALGORITHM,
    create_access_token
)


from app.models.refresh_token import RefreshToken
from app.services.audit_service import create_audit_log


# def register_company(db: Session, data: CompanyRegister):
def register_company(db, data, request):

    # Password Match
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    # Password Length
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters."
        )

    # Company Email Exists
    company = db.query(Company).filter(
        Company.email == data.company_email
    ).first()

    if company:
        raise HTTPException(
            status_code=400,
            detail="Company email already exists."
        )

    # Owner Email Exists
    user = db.query(User).filter(
        User.email == data.owner_email
    ).first()

    if user:
        raise HTTPException(
            status_code=400,
            detail="Owner email already exists."
        )

    # # Create Company
    # company = Company(
    #     name=data.company_name,
    #     industry=data.industry,
    #     email=data.company_email,
    #     address=data.company_address,
    #     phone=data.company_phone
    # )

    # db.add(company)
    # db.commit()
    # db.refresh(company)

    # print("=" * 50)
    # print("Password:", repr(data.password))
    # print("Type:", type(data.password))
    # print("Length:", len(data.password))
    # print("=" * 50)

    # # Create First Admin
    # admin = User(
    #     company_id=company.id,
    #     name=data.owner_name,
    #     email=data.owner_email,
    #     password=hash_password(data.password),
    #     role="Company Admin",
    #     status="Active"
    # )

    # # db.add(admin)
    # # db.commit()
    # # db.refresh(admin)

    # # ip = request.client.host

    # # user_agent = request.headers.get("user-agent", "")

    # # browser = get_browser(user_agent)


    # # create_audit_log(
    # #     db=db,
    # #     company_id=company.id,
    # #     user_id=admin.id,
    # #     action="Company Registered",
    # #     ip_address=ip,
    # #     browser=browser
    # # )

    # db.add(admin)

    # db.flush()

    # db.refresh(admin)

    # create_audit_log(
    #     db=db,
    #     company_id=company.id,
    #     user_id=admin.id,
    #     action="Company Registered",
    #     ip_address=request.client.host,
    #     browser=get_browser(
    #         request.headers.get("user-agent", "")
    #     )
    # )

    # db.commit()

    # db.refresh(admin)

    # return {
    #     "message": "Company registered successfully.",
    #     "company_id": company.id,
    #     "admin_id": admin.id
    # }

    # Create Company
    company = Company(
        name=data.company_name,
        industry=data.industry,
        email=data.company_email,
        address=data.company_address,
        phone=data.company_phone
    )

    db.add(company)
    db.flush()          # company.id vastundi

    # Create Admin
    admin = User(
        company_id=company.id,
        name=data.owner_name,
        email=data.owner_email,
        password=hash_password(data.password),
        role="Company Admin",
        status="Active"
    )

    db.add(admin)
    db.flush()          # admin.id vastundi

    # Create Audit Log
    create_audit_log(
        db=db,
        company_id=company.id,
        user_id=admin.id,
        action="Company Registered",
        ip_address=request.client.host,
        browser=get_browser(request.headers.get("user-agent", ""))
    )

    # One commit only
    db.commit()

    db.refresh(company)
    db.refresh(admin)

    return {
        "message": "Company registered successfully.",
        "company_id": company.id,
        "admin_id": admin.id
    }




def register_user(db, data):

    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    company = db.query(Company).filter(
        Company.id == data.company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found."
        )

    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        company_id=data.company_id,
        role=data.role,
        status="Active"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully"
    }






def login_user(db, data, request):
    print("================================")
    print("Email:", data.email)

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    print("User:", user)

    if user:
        print("DB Password:", user.password)
        print("Entered Password:", data.password)
        print(
            "Verify:",
            verify_password(
                data.password,
                user.password
            )
        )
    print("================================")

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    access_token = create_access_token({
        "user_id": user.id,
        "company_id": user.company_id,
        "role": user.role,
        "email": user.email
    })

    refresh_token = create_refresh_token({
        "user_id": user.id
    })

    refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(refresh)

    user.last_login = datetime.utcnow()

    create_audit_log(
        db=db,
        company_id=user.company_id,
        user_id=user.id,
        action="User Login",
        ip_address=request.client.host,
        browser=get_browser(
            request.headers.get("user-agent", "")
        )
    )

    db.commit()

    db.refresh(user)

    ip = request.client.host

    user_agent = request.headers.get("user-agent", "")

    browser = get_browser(user_agent)

    # create_audit_log(
    #     db=db,
    #     company_id=user.company_id,
    #     user_id=user.id,
    #     action="User Login",
    #     ip_address=ip,
    #     browser=browser
    # )

    # Get Company Details
    company = db.query(Company).filter(
        Company.id == user.company_id
    ).first()

    response = {
        "message": "Login Successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id,
            "company_name": company.name if company else "",
            "status": user.status,
            "last_login": user.last_login
        }
    }

    print(response)

    return response



def logout_user(
    db,
    current_user,
    request
):

    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id
    ).delete()

    db.commit()

    ip = request.client.host

    user_agent = request.headers.get("user-agent", "")

    browser = get_browser(user_agent)

    print("Creating Audit Log")
    print(current_user.company_id)
    print(current_user.id)

    create_audit_log(
        db=db,
        company_id=current_user.company_id,
        user_id=current_user.id,
        action="User Logout",
        ip_address=request.client.host,
        browser=browser
    )

    return {
        "message": "Logged out successfully"
    }



def refresh_access_token(db, token):

    refresh = db.query(
        RefreshToken
    ).filter(
        RefreshToken.token == token
    ).first()

    if not refresh:
        raise HTTPException(
            status_code=401,
            detail="Invalid Refresh Token"
        )

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    user = db.query(User).filter(
        User.id == payload["user_id"]
    ).first()

    access = create_access_token({
        "user_id": user.id,
        "company_id": user.company_id,
        "role": user.role,
        "email": user.email
    })

    return {
        "access_token": access
    }


def forgot_password(db, data):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    return {
        "message": "Email verified"
    }


def reset_password(
    db,
    data,
    request
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain minimum 8 characters"
        )

    user.password = hash_password(
        data.password
    )

    db.commit()

    ip = request.client.host

    user_agent = request.headers.get("user-agent", "")

    browser = get_browser(user_agent)

    create_audit_log(
        db=db,
        company_id=user.company_id,
        user_id=user.id,
        action="Password Changed",
        ip_address=ip,
        browser=browser
    )

    return {
        "message": "Password Updated Successfully"
    }




