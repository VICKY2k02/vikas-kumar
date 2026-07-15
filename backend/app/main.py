from fastapi import FastAPI

from app.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware


# Import Models
from app.models.company import Company
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.audit_log import AuditLog

from app.routes.auth_routes import router as auth_router
from app.routes.audit_routes import router as audit_router

from app.routes.profile_routes import router as profile_router


app = FastAPI(
    title="RetailPulse Analytics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

app.include_router(profile_router)

app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "message": "RetailPulse Analytics API Running Successfully"
    }