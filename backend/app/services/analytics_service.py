from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.inventory import Inventory
from app.models.audit_log import AuditLog

from datetime import datetime


def get_dashboard(
    db: Session,
    current_user,
    start_date=None,
    end_date=None,
    category=None,
    brand=None,
    payment_method=None,
    sales_channel=None
):

    company_id = current_user.company_id


    # -------------------------
    # Base Queries
    # -------------------------

    sales_query = db.query(Sale).filter(
        Sale.company_id == company_id
    )

    inventory_query = db.query(Inventory).filter(
        Inventory.company_id == company_id
    )

    product_query = db.query(Product).filter(
        Product.company_id == company_id
    )

    # -------------------------
    # Apply Filters
    # -------------------------

    if start_date:
        sales_query = sales_query.filter(
            Sale.created_at >= datetime.fromisoformat(start_date)
        )

    if end_date:
        sales_query = sales_query.filter(
            Sale.created_at <= datetime.fromisoformat(end_date)
        )

    if payment_method:
        sales_query = sales_query.filter(
            Sale.payment_method == payment_method
        )

    if sales_channel:
        sales_query = sales_query.filter(
            Sale.sales_channel == sales_channel
        )

    if brand:
        product_query = product_query.filter(
            Product.brand == brand
        )

    if category:
        product_query = product_query.filter(
            Product.category_id == category
        )












    # Total Revenue
    total_revenue = (
        sales_query.with_entities(
            func.coalesce(func.sum(Sale.total_amount), 0)
        ).scalar()
    )

    # Total Orders
    # total_orders = (
    #     db.query(Sale)
    #     .filter(Sale.company_id == company_id)
    #     .count()
    # )
    total_orders = sales_query.count()

    # Products Sold
    total_products_sold = (

        db.query(

            func.coalesce(
                func.sum(SaleItem.quantity),
                0
            )

        )

        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )

        .filter(
            Sale.id.in_(
                sales_query.with_entities(Sale.id)
            )
        )

        .scalar()

    )

    # Average Order Value
    average_order_value = 0

    if total_orders:
        average_order_value = round(
            total_revenue / total_orders,
            2
        )

    # Inventory Value
    total_inventory_value = (
        db.query(
            func.coalesce(
                func.sum(
                    Inventory.current_stock * Product.unit_price
                ),
                0
            )
        )
        .join(Product, Product.id == Inventory.product_id)
        .filter(
            Inventory.company_id == company_id
        )
        .scalar()
    )

    # Low Stock
    low_stock_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == company_id,
            Inventory.stock_status == "Low Stock"
        )
        .count()
    )

    # Out Of Stock
    out_of_stock_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == company_id,
            Inventory.stock_status == "Out of Stock"
        )
        .count()
    )

    # Categories
    total_categories = (
        db.query(Category)
        .join(Product, Product.category_id == Category.id)
        .filter(Product.company_id == company_id)
        .distinct()
        .count()
    )
    


    # Revenue Trend

    revenue_trend = []

    rows = (

        sales_query.with_entities(

            func.date(Sale.created_at),

            func.sum(Sale.total_amount)

        )

        .group_by(
            func.date(Sale.created_at)
        )

        .all()

    )

    for date, revenue in rows:

        revenue_trend.append({

            "date": str(date),

            "revenue": float(revenue)

        })

    # Sales Trend

    sales_trend = []

    rows = (

        sales_query.with_entities(

            func.date(Sale.created_at),

            func.count(Sale.id)

        )

        .group_by(
            func.date(Sale.created_at)
        )

        .all()

    )

    for date, orders in rows:

        sales_trend.append({

            "date": str(date),

            "orders": orders

        })


    # Top Selling Products

    top_products = []

    rows = (

        db.query(

            Product.name,

            func.sum(SaleItem.quantity)

        )

        .join(

            SaleItem,

            Product.id == SaleItem.product_id

        )

        .join(

            Sale,

            Sale.id == SaleItem.sale_id

        )

        .filter(
            Sale.id.in_(
                sales_query.with_entities(Sale.id)
            )
        )

        .filter(
            Product.id.in_(
                product_query.with_entities(Product.id)
            )
        )

        .group_by(

            Product.name

        )

        .order_by(

            func.sum(SaleItem.quantity).desc()

        )

        .limit(10)

        .all()

    )

    for product, qty in rows:

        top_products.append({

            "product": product,

            "quantity": qty

        })



    # Category Distribution

    category_distribution = []

    rows = (

        db.query(

            Category.name,

            func.count(SaleItem.id)

        )

        .join(

            Product,

            Product.category_id == Category.id

        )

        .join(

            SaleItem,

            SaleItem.product_id == Product.id

        )

        .join(

            Sale,

            Sale.id == SaleItem.sale_id

        )

        .filter(
            Sale.id.in_(
                sales_query.with_entities(Sale.id)
            )
        )

        .filter(
            Product.id.in_(
                product_query.with_entities(Product.id)
            )
        )

        .group_by(

            Category.name

        )

        .all()

    )

    for category, count in rows:

        category_distribution.append({

            "category": category,

            "value": count

        })



    # Inventory Status Distribution

    inventory_status_distribution = []

    rows = (

        db.query(

            Inventory.stock_status,

            func.count(Inventory.id)

        )

        .filter(
            Inventory.company_id == company_id
        )

        .filter(
            Inventory.product_id.in_(
                product_query.with_entities(Product.id)
            )
        )

        .group_by(

            Inventory.stock_status

        )

        .all()

    )

    for status, count in rows:

        inventory_status_distribution.append({

            "status": status,

            "count": count

        })



    # Audit Log

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            user_id=current_user.id,

            action="Dashboard Viewed"

        )

    )

    db.commit()



    return {

        "summary": {

            "total_revenue": total_revenue,

            "total_orders": total_orders,

            "total_products_sold": total_products_sold,

            "average_order_value": average_order_value,

            "total_inventory_value": total_inventory_value,

            "low_stock_products": low_stock_products,

            "out_of_stock_products": out_of_stock_products,

            "total_categories": total_categories

        },

        "revenue_trend": revenue_trend,

        "sales_trend": sales_trend,

        "top_products": top_products,

        "category_distribution": category_distribution,

        "inventory_status_distribution": inventory_status_distribution

    }