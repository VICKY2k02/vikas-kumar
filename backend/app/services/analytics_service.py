from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.inventory import Inventory
from app.models.audit_log import AuditLog


def get_dashboard(
    db: Session,
    current_user,
    start_date=None,
    end_date=None,
    category=None,
    brand=None,
    product=None,
    customer=None,
    payment_method=None,
    sales_channel=None,
):
    company_id = current_user.company_id

    # ----------------------------------------- 
    # 1. BASE SALES QUERY
    # -----------------------------------------


    sales_query = (
        db.query(Sale)
        .filter(Sale.company_id == company_id)
    )

    # ----------------------------------------- 
    # 2. DATE FILTERS
    # -----------------------------------------


    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        sales_query = sales_query.filter(
            Sale.created_at >= start_dt
        )

    if end_date:
        end_dt = datetime.fromisoformat(end_date)

        # Include complete end date
        if len(end_date) == 10:
            end_dt = end_dt + timedelta(days=1)

        sales_query = sales_query.filter(
            Sale.created_at < end_dt
        )

    # ----------------------------------------- 
    # 3. SALES LEVEL FILTERS
    # -----------------------------------------


    # Payment Method
    if payment_method:
        sales_query = sales_query.filter(
            func.lower(
                Sale.payment_method
            ) == payment_method.strip().lower()
        )


    # Sales Channel
    if sales_channel:
        sales_query = sales_query.filter(
            func.lower(
                Sale.sales_channel
            ) == sales_channel.strip().lower()
        )


    # Customer
    if customer:

        customer_value = str(customer).strip()

        # If frontend sends customer ID
        if customer_value.isdigit():

            sales_query = sales_query.filter(
                Sale.customer_id == int(customer_value)
            )

        # If Sale.customer_id is not available/matching,
        # customer name can also be matched.
        else:

            sales_query = sales_query.filter(
                func.lower(
                    Sale.customer_name
                ) == customer_value.lower()
            )


    # ----------------------------------------- 
    # 4. PRODUCT / CATEGORY / BRAND FILTERS
    # -----------------------------------------


    if category or brand or product:

        filtered_sales_query = (
            db.query(Sale.id)
            .join(
                SaleItem,
                Sale.id == SaleItem.sale_id
            )
            .join(
                Product,
                Product.id == SaleItem.product_id
            )
            .filter(
                Sale.company_id == company_id
            )
        )

        # Category
        if category:

            filtered_sales_query = (
                filtered_sales_query.filter(
                    Product.category_id == int(category)
                )
            )

        # Brand
        if brand:

            filtered_sales_query = (
                filtered_sales_query.filter(
                    func.lower(Product.brand)
                    == brand.strip().lower()
                )
            )

        # Product
        if product:

            filtered_sales_query = (
                filtered_sales_query.filter(
                    Product.id == int(product)
                )
            )

        # Apply product/category/brand
        # filtered sale IDs to main sales query

        sales_query = sales_query.filter(
            Sale.id.in_(
                filtered_sales_query.with_entities(
                    Sale.id
                )
            )
        )

    # ----------------------------------------- 
    # 5. PRODUCT QUERY
    # -----------------------------------------


    product_query = (
        db.query(Product)
        .filter(
            Product.company_id == company_id
        )
    )


    # Category filter
    if category:

        product_query = product_query.filter(
            Product.category_id == int(category)
        )


    # Brand filter
    if brand:

        product_query = product_query.filter(
            func.lower(Product.brand)
            == brand.strip().lower()
        )


    # Product filter
    if product:

        product_query = product_query.filter(
            Product.id == int(product)
        )


    filtered_product_ids = (
        product_query
        .with_entities(Product.id)
        .subquery()
    )

    # ----------------------------------------- 
    # 5. KPI - TOTAL REVENUE
    # -----------------------------------------


    total_revenue = (
        sales_query.with_entities(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        ).scalar()
        or 0
    )

    total_revenue = float(total_revenue)

    # ----------------------------------------- 
    # 6. KPI - TOTAL ORDERS
    # -----------------------------------------


    total_orders = sales_query.count()

    # ----------------------------------------- 
    # 7. KPI - TOTAL ITEMS SOLD
    # -----------------------------------------


    total_items_sold = (
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
        .filter(
            SaleItem.product_id.in_(
                product_query.with_entities(Product.id)
            )
        )
        .scalar()
        or 0
    )

    total_items_sold = int(total_items_sold)

    # ----------------------------------------- 
    # 8. KPI - AVERAGE ORDER VALUE
    # -----------------------------------------


    average_order_value = 0

    if total_orders > 0:
        average_order_value = round(
            total_revenue / total_orders,
            2
        )

    # -----------------------------------------
    # 9. DISCOUNT
    # -----------------------------------------


    total_discount = (
        sales_query.with_entities(
            func.coalesce(
                func.sum(Sale.discount),
                0
            )
        ).scalar()
        or 0
    )

    total_discount = float(total_discount)

    # -----------------------------------------
    # 10. TAX
    # -----------------------------------------


    total_tax = (
        sales_query.with_entities(
            func.coalesce(
                func.sum(Sale.tax),
                0
            )
        ).scalar()
        or 0
    )

    total_tax = float(total_tax)

    # ----------------------------------------- 
    # 11. INVENTORY VALUE
    # -----------------------------------------


    total_inventory_value = (
        db.query(
            func.coalesce(
                func.sum(
                    Inventory.current_stock
                    * Product.unit_price
                ),
                0
            )
        )
        .join(
            Product,
            Product.id == Inventory.product_id
        )
        .filter(
            Inventory.company_id == company_id
        )
        .scalar()
        or 0
    )

    total_inventory_value = float(
        total_inventory_value
    )

    # ----------------------------------------- 
    # 12. LOW STOCK
    # -----------------------------------------


    low_stock_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == company_id,
            Inventory.stock_status == "Low Stock"
        )
        .count()
    )

    # ----------------------------------------- 
    # 13. OUT OF STOCK
    # -----------------------------------------


    out_of_stock_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == company_id,
            Inventory.stock_status == "Out of Stock"
        )
        .count()
    )

    # ----------------------------------------- 
    # 14. TOTAL CATEGORIES
    # -----------------------------------------


    total_categories = (
        db.query(Category)
        .join(
            Product,
            Product.category_id == Category.id
        )
        .filter(
            Product.company_id == company_id
        )
        .distinct()
        .count()
    )

    # ----------------------------------------- 
    # 15. DAILY REVENUE TREND
    # -----------------------------------------


    daily_revenue = []

    rows = (
        sales_query.with_entities(
            func.date(Sale.created_at).label("date"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("revenue")
        )
        .group_by(
            func.date(Sale.created_at)
        )
        .order_by(
            func.date(Sale.created_at)
        )
        .all()
    )

    for date, revenue in rows:
        daily_revenue.append({
            "date": str(date),
            "revenue": float(revenue or 0)
        })

    # ----------------------------------------- 
    # 16. DAILY ORDERS TREND
    # -----------------------------------------


    daily_orders = []

    rows = (
        sales_query.with_entities(
            func.date(Sale.created_at).label("date"),
            func.count(Sale.id).label("orders")
        )
        .group_by(
            func.date(Sale.created_at)
        )
        .order_by(
            func.date(Sale.created_at)
        )
        .all()
    )

    for date, orders in rows:
        daily_orders.append({
            "date": str(date),
            "orders": int(orders)
        })

    # ----------------------------------------- 
    # 17. WEEKLY REVENUE TREND
    # -----------------------------------------

    # SQLite-compatible weekly grouping

    weekly_revenue = []

    rows = (
        sales_query.with_entities(
            func.strftime(
                "%Y-%W",
                Sale.created_at
            ).label("week"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("revenue")
        )
        .group_by(
            func.strftime(
                "%Y-%W",
                Sale.created_at
            )
        )
        .order_by(
            func.strftime(
                "%Y-%W",
                Sale.created_at
            )
        )
        .all()
    )

    for week, revenue in rows:
        weekly_revenue.append({
            "period": str(week),
            "revenue": float(revenue or 0)
        })

    # ----------------------------------------- 
    # 18. MONTHLY REVENUE TREND
    # -----------------------------------------


    monthly_revenue = []

    rows = (
        sales_query.with_entities(
            func.strftime(
                "%Y-%m",
                Sale.created_at
            ).label("month"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("revenue")
        )
        .group_by(
            func.strftime(
                "%Y-%m",
                Sale.created_at
            )
        )
        .order_by(
            func.strftime(
                "%Y-%m",
                Sale.created_at
            )
        )
        .all()
    )

    for month, revenue in rows:
        monthly_revenue.append({
            "period": str(month),
            "revenue": float(revenue or 0)
        })

    # ----------------------------------------- 
    # 19. TOP PRODUCTS
    # -----------------------------------------


    top_products = []

    rows = (
        db.query(
            Product.name.label("product"),
            func.coalesce(
                func.sum(SaleItem.quantity),
                0
            ).label("quantity"),
            func.coalesce(
                func.sum(
                    SaleItem.quantity * SaleItem.unit_price
                ),
                0
            ).label("revenue")
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
            func.sum(
                SaleItem.quantity * SaleItem.unit_price
            ).desc()
        )
        .limit(10)
        .all()
    )

    for product, quantity, revenue in rows:
        top_products.append({
            "product": product,
            "quantity": int(quantity or 0),
            "revenue": float(revenue or 0)
        })

    # ----------------------------------------- 
    # 20. TOP CUSTOMERS
    # -----------------------------------------

     
    top_customers = []

    rows = (
        sales_query.with_entities(
            Sale.customer_name.label("customer"),
            func.count(Sale.id).label("orders"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("total_spend")
        )
        .group_by(
            Sale.customer_name
        )
        .order_by(
            func.sum(Sale.total_amount).desc()
        )
        .limit(10)
        .all()
    )

    for customer, orders, total_spend in rows:

        total_spend = float(
            total_spend or 0
        )

        orders = int(orders)

        avg_order_value = 0

        if orders > 0:
            avg_order_value = round(
                total_spend / orders,
                2
            )

        top_customers.append({
            "customer": customer or "Unknown",
            "orders": orders,
            "total_spend": total_spend,
            "average_order_value": avg_order_value
        })

    # ----------------------------------------- 
    # 21. PAYMENT METHOD ANALYSIS
    # -----------------------------------------


    payment_method_analysis = []

    rows = (
        sales_query.with_entities(
            Sale.payment_method.label("payment_method"),
            func.count(Sale.id).label("transactions"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("revenue")
        )
        .group_by(
            Sale.payment_method
        )
        .order_by(
            func.sum(Sale.total_amount).desc()
        )
        .all()
    )

    for method, transactions, revenue in rows:
        payment_method_analysis.append({
            "payment_method": method or "Other",
            "transactions": int(transactions),
            "revenue": float(revenue or 0)
        })

    # ----------------------------------------- 
    # 22. SALES VS ORDERS
    # -----------------------------------------


    sales_vs_orders = []

    rows = (
        sales_query.with_entities(
            func.date(Sale.created_at).label("date"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("revenue"),
            func.count(Sale.id).label("orders")
        )
        .group_by(
            func.date(Sale.created_at)
        )
        .order_by(
            func.date(Sale.created_at)
        )
        .all()
    )

    for date, revenue, orders in rows:
        sales_vs_orders.append({
            "date": str(date),
            "revenue": float(revenue or 0),
            "orders": int(orders)
        })

    # ----------------------------------------- 
    # 23. CATEGORY DISTRIBUTION
    # -----------------------------------------


    category_distribution = []

    rows = (
        db.query(
            Category.name.label("category"),
            func.coalesce(
                func.sum(SaleItem.quantity),
                0
            ).label("value")
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

    for category_name, value in rows:
        category_distribution.append({
            "category": category_name,
            "value": int(value or 0)
        })

    # ----------------------------------------- 
    # 24. INVENTORY STATUS DISTRIBUTION
    # -----------------------------------------


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
            "count": int(count)
        })

    # ----------------------------------------- 
    # 25. AUDIT LOG
    # -----------------------------------------


    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action="Dashboard Viewed"
        )
    )

    db.commit()

    # ----------------------------------------- 
    # 26. FINAL RESPONSE
    # -----------------------------------------


    return {

        "summary": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_items_sold": total_items_sold,
            "average_order_value": average_order_value,
            "total_discount": total_discount,
            "total_tax": total_tax,

            # Existing dashboard KPIs
            "total_inventory_value": total_inventory_value,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "total_categories": total_categories
        },

        "revenue_trend": daily_revenue,

        "daily_revenue": daily_revenue,

        "weekly_revenue": weekly_revenue,

        "monthly_revenue": monthly_revenue,

        "sales_trend": daily_orders,

        "sales_vs_orders": sales_vs_orders,

        "top_products": top_products,

        "top_customers": top_customers,

        "payment_method_analysis":
            payment_method_analysis,

        "category_distribution":
            category_distribution,

        "inventory_status_distribution":
            inventory_status_distribution
    }