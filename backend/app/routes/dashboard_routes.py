from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.category import Category
from app.models.product import Product

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    total_categories = db.query(Category).filter(
        Category.company_id == current_user.company_id
    ).count()

    total_products = db.query(Product).filter(
        Product.company_id == current_user.company_id
    ).count()

    active_products = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.status == "Active"
    ).count()

    inactive_products = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.status == "Inactive"
    ).count()

    total_stock = db.query(
        func.coalesce(func.sum(Product.stock_quantity), 0)
    ).filter(
        Product.company_id == current_user.company_id
    ).scalar()

    inventory_value = db.query(
        func.coalesce(
            func.sum(
                Product.stock_quantity * Product.unit_price
            ),
            0
        )
    ).filter(
        Product.company_id == current_user.company_id
    ).scalar()

    return {
        "total_categories": total_categories,
        "total_products": total_products,
        "active_products": active_products,
        "inactive_products": inactive_products,
        "total_stock": total_stock,
        "inventory_value": inventory_value
    }