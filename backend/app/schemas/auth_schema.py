from pydantic import BaseModel, EmailStr


class CompanyRegister(BaseModel):

    company_name: str

    industry: str

    company_email: EmailStr

    company_address: str

    company_phone: str

    owner_name: str

    owner_email: EmailStr

    password: str

    confirm_password: str


class LoginSchema(BaseModel):

    email: EmailStr

    password: str


class RefreshSchema(BaseModel):
    refresh_token: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str


class UserRegisterSchema(BaseModel):

    name: str

    email: EmailStr

    password: str

    confirm_password: str

    company_id: int

    role: str