from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.product import Product
from app.models.category import Category
from app.models.audit_log import AuditLog

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/")
def create_product(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if data["unit_price"] <= 0:
        raise HTTPException(400, "Unit Price must be greater than zero")

    if data["cost_price"] > data["unit_price"]:
        raise HTTPException(400, "Cost Price cannot exceed Unit Price")

    if data["stock_quantity"] < 0:
        raise HTTPException(400, "Stock cannot be negative")

    sku = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.sku == data["sku"]
    ).first()

    if sku:
        raise HTTPException(400, "SKU already exists")

    duplicate = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.category_id == data["category_id"],
        Product.name == data["name"]
    ).first()

    if duplicate:
        raise HTTPException(400, "Product already exists in this category")

    category = db.query(Category).filter(
        Category.id == data["category_id"],
        Category.company_id == current_user.company_id
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")
        
    existing_sku = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.sku == data["sku"]
    ).first()

    if existing_sku:
        raise HTTPException(
            status_code=400,
            detail="SKU already exists"
        )


    product = Product(
        company_id=current_user.company_id,
        category_id=data["category_id"],
        name=data["name"],
        sku=data["sku"],
        brand=data["brand"],
        description=data.get("description", ""),
        unit_price=data["unit_price"],
        cost_price=data["cost_price"],
        stock_quantity=data["stock_quantity"],
        unit_of_measure=data["unit_of_measure"],
        status=data.get("status", "Active")
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action=f"Product Created : {product.name}"
        )
    )
    db.commit()

    return {
        "message": "Product Created Successfully"
    }


@router.get("/")
def get_products(
    search: str = "",
    category: int | None = None,
    brand: str = "",
    status: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    query = db.query(Product).filter(
        Product.company_id == current_user.company_id
    )

    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.sku.ilike(f"%{search}%"))
        )

    if category:
        query = query.filter(Product.category_id == category)

    if brand:
        query = query.filter(Product.brand == brand)

    if status:
        query = query.filter(Product.status == status)

    products = query.order_by(Product.created_at.desc()).all()

    result = []

    for p in products:

        cat = db.query(Category).filter(
            Category.id == p.category_id
        ).first()

        result.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": cat.name if cat else "",
            "brand": p.brand,
            "unit_price": p.unit_price,
            "cost_price": p.cost_price,
            "stock_quantity": p.stock_quantity,
            "unit_of_measure": p.unit_of_measure,
            "status": p.status,
            "created_at": p.created_at
        })

    return result


@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()

    if not product:
        raise HTTPException(404, "Product not found")

    return product


@router.put("/{product_id}")
def update_product(
    product_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()


    existing_sku = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.sku == data["sku"],
        Product.id != product_id
    ).first()

    if existing_sku:
        raise HTTPException(
            status_code=400,
            detail="SKU already exists"
        )

    if not product:
        raise HTTPException(404, "Product not found")

    product.name = data["name"]
    product.category_id = data.get(
        "category_id",
        product.category_id
    )
    product.brand = data["brand"]
    product.description = data.get("description", "")
    product.unit_price = data["unit_price"]
    product.cost_price = data["cost_price"]
    product.stock_quantity = data["stock_quantity"]
    product.unit_of_measure = data["unit_of_measure"]
    product.status = data["status"]

    db.commit()

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action=f"Product Updated : {product.name}"
        )
    )

    db.commit()

    return {
        "message": "Product Updated Successfully"
    }


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()

    if not product:
        raise HTTPException(404, "Product not found")

    name = product.name

    db.delete(product)
    db.commit()

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action=f"Product Deleted : {name}"
        )
    )

    db.commit()

    return {
        "message": "Product Deleted Successfully"
    }


@router.patch("/{product_id}/status")
def change_status(
    product_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()

    if not product:
        raise HTTPException(404, "Product not found")

    product.status = status

    db.commit()

    action = "Product Activated"

    if status == "Inactive":
        action = "Product Deactivated"

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action=f"{action} : {product.name}"
        )
    )

    db.commit()

    return {
        "message": "Status Updated"
    }


@router.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

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

    total_categories = db.query(Category).filter(
        Category.company_id == current_user.company_id
    ).count()

    return {
        "total_products": total_products,
        "active_products": active_products,
        "inactive_products": inactive_products,
        "total_categories": total_categories
    }