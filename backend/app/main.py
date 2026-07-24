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

from app.models.category import Category
from app.models.product import Product

from app.routes.category_routes import router as category_router

from app.routes.product_routes import router as product_router

from app.routes.dashboard_routes import router as dashboard_router

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.routes.sales_routes import router as sales_router

from app.routes.notification_routes import router as notification_router

from app.models.inventory import Inventory
from app.models.inventory_movement import InventoryMovement
from app.routes.inventory_routes import router as inventory_router

from app.routes.analytics_routes import router as analytics_router


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

app.include_router(category_router)

app.include_router(product_router)

app.include_router(dashboard_router)

app.include_router(sales_router)

app.include_router(notification_router)

app.include_router(inventory_router)

app.include_router(analytics_router)



@app.get("/")
def root():
    return {
        "message": "RetailPulse Analytics API Running Successfully"
    }