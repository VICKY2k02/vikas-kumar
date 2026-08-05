from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles

from app.models.category import Category
from app.models.product import Product

from app.services.dashboard_service import (
    inventory_by_category_service,
    stock_status_service,
    inventory_value_category_service,
    top_stock_products_service
)


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



@router.get("/inventory-by-category")
def inventory_by_category(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Company Admin","Analyst"))
):
    return inventory_by_category_service(
        db,
        current_user
    )


@router.get("/stock-status")
def stock_status(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Company Admin","Analyst"))
):
    return stock_status_service(
        db,
        current_user
    )


@router.get("/inventory-value-category")
def inventory_value_category(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Company Admin","Analyst"))
):
    return inventory_value_category_service(
        db,
        current_user
    )



@router.get("/top-stock-products")
def top_stock_products(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Company Admin","Analyst"))
):
    return top_stock_products_service(
        db,
        current_user
    )









