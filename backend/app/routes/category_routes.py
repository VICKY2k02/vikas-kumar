from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.category import Category
from app.models.product import Product
from app.models.audit_log import AuditLog

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/")
def create_category(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    exists = db.query(Category).filter(
        Category.company_id == current_user.company_id,
        Category.name == data["name"]
    ).first()

    if exists:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    category = Category(
        company_id=current_user.company_id,
        name=data["name"],
        description=data.get("description", ""),
        status=data.get("status", "Active")
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    audit = AuditLog(
        company_id=current_user.company_id,
        user_id=current_user.id,
        action=f"Category Created : {category.name}"
    )

    db.add(audit)
    db.commit()

    return {
        "message": "Category Created Successfully"
    }


@router.get("/")
def get_categories(
    search: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    categories = (
        db.query(
            Category,
            func.count(Product.id).label("products")
        )
        .outerjoin(Product, Product.category_id == Category.id)
        .filter(Category.company_id == current_user.company_id)
        .filter(Category.name.ilike(f"%{search}%"))
        .group_by(Category.id)
        .all()
    )

    result = []

    for category, count in categories:

        result.append({

            "id": category.id,

            "name": category.name,

            "description": category.description,

            "status": category.status,

            "product_count": count

        })

    return result


@router.get("/{category_id}")
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.company_id == current_user.company_id
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    return category


@router.put("/{category_id}")
def update_category(
    category_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.company_id == current_user.company_id
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    category.name = data["name"]
    category.description = data.get("description", "")
    category.status = data.get("status", "Active")

    db.commit()

    audit = AuditLog(
        company_id=current_user.company_id,
        user_id=current_user.id,
        action=f"Category Updated : {category.name}"
    )

    db.add(audit)
    db.commit()

    return {
        "message": "Category Updated Successfully"
    }


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.company_id == current_user.company_id
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    name = category.name

    db.delete(category)
    db.commit()

    audit = AuditLog(
        company_id=current_user.company_id,
        user_id=current_user.id,
        action=f"Category Deleted : {name}"
    )

    db.add(audit)
    db.commit()

    return {
        "message": "Category Deleted Successfully"
    }