from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.inventory import Inventory

from app.models.demand_forecast import DemandForecast
from app.models.forecast_history import ForecastHistory

from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.inventory import Inventory

# -----------------------------------------
# Moving Average
# -----------------------------------------
def calculate_moving_average(total_sales: float, days: int):

    if days <= 0:
        return 0

    return total_sales / days


# -----------------------------------------
# Confidence Score
# -----------------------------------------
def calculate_confidence(predicted, historical):

    if historical == 0:
        return 0

    diff = abs(predicted - historical)

    score = max(0, 100 - (diff / historical) * 100)

    return round(score, 2)


# -----------------------------------------
# Generate Product Forecast
# -----------------------------------------
def generate_product_forecasts(
    db: Session,
    current_user,
    period: int
):

    start_date = datetime.utcnow() - timedelta(days=30)

    forecasts = []

    products = (

        db.query(Product)

        .filter(
            Product.company_id == current_user.company_id,
            Product.status == "Active"
        )

        .all()

    )

    for product in products:

        historical_sales = (

            db.query(
                func.sum(SaleItem.quantity)
            )

            .join(
                Sale,
                Sale.id == SaleItem.sale_id
            )

            .filter(
                Sale.company_id == current_user.company_id,
                SaleItem.product_id == product.id,
                Sale.created_at >= start_date
            )

            .scalar()

            or 0

        )

        daily_average = calculate_moving_average(
            historical_sales,
            30
        )

        predicted = round(
            daily_average * period,
            2
        )

        confidence = calculate_confidence(
            predicted,
            historical_sales
        )

        existing = (

            db.query(DemandForecast)

            .filter(
                DemandForecast.company_id == current_user.company_id,
                DemandForecast.product_id == product.id,
                DemandForecast.forecast_period == f"{period} Days"
            )

            .first()

        )

        if existing:

            existing.predicted_demand = predicted

            existing.confidence_score = confidence

            existing.generated_at = datetime.utcnow()

            forecast = existing

        else:

            forecast = DemandForecast(

                company_id=current_user.company_id,

                product_id=product.id,

                category_id=product.category_id,

                forecast_period=f"{period} Days",

                predicted_demand=predicted,

                confidence_score=confidence

            )

            db.add(forecast)

        db.flush()

        history = ForecastHistory(

            forecast_id=forecast.id,

            historical_sales=historical_sales,

            prediction=predicted,

            accuracy=confidence

        )

        db.add(history)

        # --------------------------
        # Notifications
        # --------------------------

        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == product.id
            )
            .first()
        )

        current_stock = inventory.current_stock if inventory else 0

        # 1. Out of Stock
        if current_stock <= 0:

            db.add(
                Notification(
                    company_id=current_user.company_id,
                    title="Product Out Of Stock",
                    message=f"{product.name} is predicted to run out of stock."
                )
            )

        # 2. Forecast exceeds inventory
        elif forecast.predicted_demand > current_stock:

            db.add(
                Notification(
                    company_id=current_user.company_id,
                    title="Inventory Alert",
                    message=f"Forecast demand for {product.name} exceeds available inventory."
                )
            )

        # 3. High Growth
        if confidence >= 90:

            db.add(
                Notification(
                    company_id=current_user.company_id,
                    title="High Growth Product",
                    message=f"{product.name} shows significant demand growth."
                )
            )

        db.add(

            AuditLog(
                company_id=current_user.company_id,
                action="Forecast Generated",
                product_name=product.name
            )

        )

        forecasts.append(forecast)

    db.commit()

    return forecasts


# -----------------------------------------
# Product Forecast List
# -----------------------------------------
def get_product_forecasts(
    db: Session,
    current_user
):

    forecasts = (

        db.query(
            DemandForecast,
            Product,
            Inventory
        )

        .join(
            Product,
            Product.id == DemandForecast.product_id
        )

        .outerjoin(
            Inventory,
            Inventory.product_id == Product.id
        )

        .filter(
            DemandForecast.company_id ==
            current_user.company_id
        )

        .all()

    )

    data = []

    for forecast, product, inventory in forecasts:

        current_stock = 0

        if inventory:
            current_stock = inventory.current_stock

        historical = (

            db.query(ForecastHistory)

            .filter(
                ForecastHistory.forecast_id ==
                forecast.id
            )

            .order_by(
                ForecastHistory.id.desc()
            )

            .first()

        )

        current_stock = inventory.current_stock if inventory else 0

        reorder_level = 20

        if current_stock <= 0:
            recommendation = "Immediate Restock Required"

        elif current_stock < reorder_level:
            recommendation = "Reorder Soon"

        elif current_stock > forecast.predicted_demand * 3:
            recommendation = "Overstock Risk"

        else:
            recommendation = "Healthy"


        # db.add(

        #     AuditLog(

        #         company_id=current_user.company_id,

        #         action="Inventory Recommendation Generated",

        #         module="Demand Forecast",

        #         description=f"{product.name} : {recommendation}",

        #         performed_by=current_user.email

        #     )

        # )

        data.append({

            "id": forecast.id,

            "product_name": product.name,

            "category": product.category.name,

            "current_stock": current_stock,

            "historical_sales": historical.historical_sales if historical else 0,

            "predicted_demand": forecast.predicted_demand,

            "forecast_period": forecast.forecast_period,

            "confidence_score": forecast.confidence_score,

            "reorder_level": reorder_level,

            "recommendation": recommendation

        })

    return data


# -----------------------------------------
# Category Forecast
# -----------------------------------------
def get_category_forecasts(
    db: Session,
    current_user
):

    forecasts = (

        db.query(

            Category.name,

            func.sum(
                ForecastHistory.historical_sales
            ),

            func.sum(
                DemandForecast.predicted_demand
            )

        )

        .join(
            Product,
            Product.category_id == Category.id
        )

        .join(
            DemandForecast,
            DemandForecast.product_id == Product.id
        )

        .join(
            ForecastHistory,
            ForecastHistory.forecast_id == DemandForecast.id
        )

        .filter(
            DemandForecast.company_id ==
            current_user.company_id
        )

        .group_by(
            Category.name
        )

        .all()

    )

    result = []

    for row in forecasts:

        growth = 0

        if row[1]:

            growth = (
                (
                    row[2] - row[1]
                ) / row[1]
            ) * 100

        result.append({

            "category": row[0],

            "historical_sales": row[1],

            "predicted_demand": row[2],

            "growth": round(growth, 2)

        })

    return result


# -----------------------------------------
# Dashboard KPI
# -----------------------------------------

def dashboard_summary(db: Session, current_user):

    forecasts = (
        db.query(DemandForecast)
        .filter(
            DemandForecast.company_id == current_user.company_id
        )
        .all()
    )

    total_predicted = sum(
        f.predicted_demand
        for f in forecasts
    )

    high_growth = len([
        f for f in forecasts
        if f.confidence_score > 90
    ])

    # --------------------------
    # Product Trend
    # --------------------------

    product_trend = []

    top_products = []

    for forecast in forecasts:

        product = (
            db.query(Product)
            .filter(Product.id == forecast.product_id)
            .first()
        )

        history = (
            db.query(ForecastHistory)
            .filter(
                ForecastHistory.forecast_id == forecast.id
            )
            .order_by(ForecastHistory.id.desc())
            .first()
        )

        historical = history.historical_sales if history else 0

        product_trend.append({

            "product": product.name,

            "predicted": forecast.predicted_demand

        })

        top_products.append({

            "product": product.name,

            "predicted": forecast.predicted_demand

        })

    # --------------------------
    # Historical vs Forecast
    # --------------------------

    historical_vs_forecast = []

    for forecast in forecasts:

        history = (
            db.query(ForecastHistory)
            .filter(
                ForecastHistory.forecast_id == forecast.id
            )
            .order_by(ForecastHistory.id.desc())
            .first()
        )

        if history:

            historical_vs_forecast.append({

                "month": forecast.forecast_period,

                "historical": history.historical_sales,

                "forecast": forecast.predicted_demand

            })

    # --------------------------
    # Category Trend
    # --------------------------

    category_trend = []

    categories = (
        db.query(Category)
        .filter(
            Category.company_id == current_user.company_id
        )
        .all()
    )

    for category in categories:

        predicted = (
            db.query(
                func.sum(DemandForecast.predicted_demand)
            )
            .filter(
                DemandForecast.company_id == current_user.company_id,
                DemandForecast.category_id == category.id
            )
            .scalar()
            or 0
        )

        category_trend.append({

            "category": category.name,

            "predicted": predicted

        })

    # --------------------------
    # Seasonal Pattern
    # --------------------------

    seasonal_pattern = []

    months = [

        "Jan","Feb","Mar","Apr",
        "May","Jun","Jul","Aug",
        "Sep","Oct","Nov","Dec"

    ]

    monthly_sales = {}

    sales = (
        db.query(Sale)
        .filter(
            Sale.company_id == current_user.company_id
        )
        .all()
    )

    for sale in sales:

        month = months[sale.created_at.month-1]

        monthly_sales[month] = monthly_sales.get(month,0) + sale.total_amount

    for m,v in monthly_sales.items():

        seasonal_pattern.append({

            "month": m,

            "sales": v

        })

    return {

        "total_predicted_demand": total_predicted,

        "products_forecasted": len(forecasts),

        "high_growth_products": high_growth,

        "historical_vs_forecast": historical_vs_forecast,

        "product_trend": product_trend,

        "category_trend": category_trend,

        "top_products": top_products,

        "seasonal_pattern": seasonal_pattern

    }