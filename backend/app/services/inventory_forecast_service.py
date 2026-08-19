from datetime import datetime, timedelta
from math import ceil

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.inventory import Inventory


HISTORY_DAYS = 30
FORECAST_DAYS = 30
LEAD_TIME_DAYS = 7
SAFETY_DAYS = 3


def calculate_average_daily_demand(total_units: float) -> float:
    if not total_units:
        return 0.0

    return round(total_units / HISTORY_DAYS, 2)


def calculate_forecasted_demand(
    average_daily_demand: float,
    forecast_days: int
) -> float:

    return round(
        average_daily_demand * forecast_days,
        2
    )


def calculate_safety_stock(
    average_daily_demand: float
) -> float:

    return round(
        average_daily_demand * SAFETY_DAYS,
        2
    )


def calculate_reorder_point(
    average_daily_demand: float,
    safety_stock: float
) -> float:

    return round(
        (average_daily_demand * LEAD_TIME_DAYS)
        + safety_stock,
        2
    )


def calculate_days_remaining(
    current_stock: float,
    average_daily_demand: float
):

    if average_daily_demand <= 0:
        return None

    return round(
        max(current_stock, 0)
        / average_daily_demand,
        2
    )


def classify_stock_risk(
    current_stock: float,
    average_daily_demand: float,
    days_remaining,
    reorder_point: float,
    forecasted_demand: float
):

    if current_stock <= 0:
        return "Out of Stock"

    if (
        average_daily_demand > 0
        and days_remaining is not None
        and days_remaining <= LEAD_TIME_DAYS
    ):
        return "Stockout Risk"

    if current_stock <= reorder_point:
        return "Low Stock"

    if (
        forecasted_demand > 0
        and current_stock > forecasted_demand * 3
    ):
        return "Overstock"

    return "Healthy"


def calculate_recommended_quantity(
    current_stock: float,
    forecasted_demand: float,
    safety_stock: float
) -> int:

    target_stock = (
        forecasted_demand
        + safety_stock
    )

    quantity = max(
        0,
        target_stock - current_stock
    )

    return int(ceil(quantity))


def get_product_sales(
    db: Session,
    company_id: int,
    product_id: int
):

    start_date = (
        datetime.utcnow()
        - timedelta(days=HISTORY_DAYS)
    )

    total = (
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
            Sale.company_id == company_id,
            SaleItem.product_id == product_id,
            Sale.created_at >= start_date
        )
        .scalar()
    )

    return float(total or 0)


def build_forecast_row(
    db: Session,
    product,
    inventory,
    company_id: int,
    forecast_days: int = FORECAST_DAYS
):

    historical_sales = get_product_sales(
        db,
        company_id,
        product.id
    )

    average_daily_demand = (
        calculate_average_daily_demand(
            historical_sales
        )
    )

    forecasted_demand = (
        calculate_forecasted_demand(
            average_daily_demand,
            forecast_days
        )
    )

    safety_stock = calculate_safety_stock(
        average_daily_demand
    )

    reorder_point = calculate_reorder_point(
        average_daily_demand,
        safety_stock
    )

    current_stock = float(
        inventory.current_stock
        if inventory
        else 0
    )

    available_stock = float(
        inventory.available_stock
        if inventory
        else current_stock
    )

    days_remaining = calculate_days_remaining(
        available_stock,
        average_daily_demand
    )

    risk = classify_stock_risk(
        available_stock,
        average_daily_demand,
        days_remaining,
        reorder_point,
        forecasted_demand
    )

    recommended_quantity = (
        calculate_recommended_quantity(
            available_stock,
            forecasted_demand,
            safety_stock
        )
    )

    reorder_required = (
        recommended_quantity > 0
        or risk in [
            "Out of Stock",
            "Stockout Risk",
            "Low Stock"
        ]
    )

    if risk == "Out of Stock":
        recommendation = "Immediate Reorder Required"

    elif risk == "Stockout Risk":
        recommendation = "Urgent Replenishment Required"

    elif risk == "Low Stock":
        recommendation = "Reorder Soon"

    elif risk == "Overstock":
        recommendation = "Reduce / Pause Reordering"

    elif average_daily_demand == 0:
        recommendation = "No Sales History"

    else:
        recommendation = "Inventory Healthy"

    return {
        "product_id": product.id,
        "product": product.name,
        "sku": product.sku,
        "category_id": product.category_id,
        "category": (
            product.category.name
            if getattr(product, "category", None)
            else "-"
        ),

        "current_stock": current_stock,
        "available_stock": available_stock,

        "historical_sales": historical_sales,

        "average_daily_sales":
            average_daily_demand,

        "forecasted_demand":
            forecasted_demand,

        "forecast_days":
            forecast_days,

        "lead_time_days":
            LEAD_TIME_DAYS,

        "safety_stock":
            safety_stock,

        "reorder_point":
            reorder_point,

        "days_of_stock_remaining":
            days_remaining,

        "recommended_reorder_quantity":
            recommended_quantity,

        "stock_risk":
            risk,

        "reorder_required":
            reorder_required,

        "recommendation":
            recommendation
    }


def get_inventory_forecast(
    db: Session,
    current_user,
    forecast_days: int = FORECAST_DAYS
):

    if forecast_days <= 0:
        forecast_days = FORECAST_DAYS

    records = (
        db.query(
            Product,
            Inventory
        )
        .outerjoin(
            Inventory,
            Inventory.product_id == Product.id
        )
        .filter(
            Product.company_id ==
            current_user.company_id,
            Product.status == "Active"
        )
        .all()
    )

    result = []

    for product, inventory in records:

        result.append(
            build_forecast_row(
                db=db,
                product=product,
                inventory=inventory,
                company_id=current_user.company_id,
                forecast_days=forecast_days
            )
        )

    return result


def get_recommendations(
    db: Session,
    current_user,
    forecast_days: int = FORECAST_DAYS
):

    rows = get_inventory_forecast(
        db,
        current_user,
        forecast_days
    )

    return [
        row
        for row in rows
        if row["reorder_required"]
    ]


def get_product_recommendation(
    db: Session,
    current_user,
    product_id: int,
    forecast_days: int = FORECAST_DAYS
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.company_id ==
            current_user.company_id
        )
        .first()
    )

    if not product:
        return None

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.product_id ==
            product_id,
            Inventory.company_id ==
            current_user.company_id
        )
        .first()
    )

    return build_forecast_row(
        db=db,
        product=product,
        inventory=inventory,
        company_id=current_user.company_id,
        forecast_days=forecast_days
    )


def get_forecast_summary(
    db: Session,
    current_user,
    forecast_days: int = FORECAST_DAYS
):

    rows = get_inventory_forecast(
        db,
        current_user,
        forecast_days
    )

    return {
        "total_products": len(rows),

        "products_requiring_reorder": len([
            r for r in rows
            if r["reorder_required"]
        ]),

        "stockout_risk": len([
            r for r in rows
            if r["stock_risk"] == "Stockout Risk"
        ]),

        "out_of_stock": len([
            r for r in rows
            if r["stock_risk"] == "Out of Stock"
        ]),

        "low_stock": len([
            r for r in rows
            if r["stock_risk"] == "Low Stock"
        ]),

        "overstocked": len([
            r for r in rows
            if r["stock_risk"] == "Overstock"
        ]),

        "healthy": len([
            r for r in rows
            if r["stock_risk"] == "Healthy"
        ]),

        "no_sales_history": len([
            r for r in rows
            if r["average_daily_sales"] == 0
        ]),

        "total_forecasted_demand": round(
            sum(
                r["forecasted_demand"]
                for r in rows
            ),
            2
        ),

        "total_recommended_quantity": sum(
            r["recommended_reorder_quantity"]
            for r in rows
        )
    }


def get_forecast_chart(
    db: Session,
    current_user,
    forecast_days: int = FORECAST_DAYS
):

    rows = get_inventory_forecast(
        db,
        current_user,
        forecast_days
    )

    return [
        {
            "product": r["product"],
            "historical_demand":
                r["historical_sales"],
            "forecasted_demand":
                r["forecasted_demand"]
        }
        for r in rows
    ]