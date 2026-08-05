from sqlalchemy import func
from app.models.product import Product
from app.models.category import Category


def inventory_by_category_service(db, current_user):

    data = (
        db.query(
            Category.name,
            func.sum(Product.stock_quantity)
        )
        .join(Product, Product.category_id == Category.id)
        .filter(Product.company_id == current_user.company_id)
        .group_by(Category.name)
        .all()
    )

    return [
        {
            "category": x[0],
            "stock": x[1]
        }
        for x in data
    ]


def stock_status_service(db, current_user):

    active = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.status == "Active"
    ).count()

    inactive = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.status == "Inactive"
    ).count()

    return [
        {
            "name": "Active",
            "value": active
        },
        {
            "name": "Inactive",
            "value": inactive
        }
    ]


def inventory_value_category_service(db, current_user):

    data = (
        db.query(
            Category.name,
            func.sum(Product.stock_quantity * Product.unit_price)
        )
        .join(Product, Product.category_id == Category.id)
        .filter(Product.company_id == current_user.company_id)
        .group_by(Category.name)
        .all()
    )

    print(data)

    return [
        {
            "category": x[0],
            "value": float(x[1] or 0)
        }
        for x in data
    ]


def top_stock_products_service(db, current_user):

    data = (
        db.query(Product)
        .filter(Product.company_id == current_user.company_id)
        .order_by(Product.stock_quantity.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "product": p.name,
            "stock": p.stock_quantity
        }
        for p in data
    ]






