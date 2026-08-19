from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.services.inventory_forecast_service import (
    get_inventory_forecast,
    get_recommendations,
    get_product_recommendation,
    get_forecast_summary,
    get_forecast_chart
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory Forecast"]
)


@router.get("/forecast")
def inventory_forecast(
    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    search: str = "",
    category: int | None = None,
    risk: str = "",
    reorder_required: bool | None = None,

    sort_by: str = "days_remaining",
    sort_order: str = "asc",

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        rows = get_inventory_forecast(
            db,
            current_user,
            forecast_days
        )

        if search:
            search_lower = search.lower()

            rows = [
                r for r in rows
                if search_lower in
                r["product"].lower()
                or search_lower in
                (r["sku"] or "").lower()
            ]

        if category is not None:
            rows = [
                r for r in rows
                if r["category_id"] == category
            ]

        if risk:
            rows = [
                r for r in rows
                if r["stock_risk"] == risk
            ]

        if reorder_required is not None:
            rows = [
                r for r in rows
                if r["reorder_required"]
                == reorder_required
            ]

        sort_map = {
            "product": "product",
            "current_stock": "current_stock",
            "forecasted_demand": "forecasted_demand",
            "days_remaining":
                "days_of_stock_remaining",
            "recommended_quantity":
                "recommended_reorder_quantity",
            "risk": "stock_risk"
        }

        key = sort_map.get(
            sort_by,
            "days_of_stock_remaining"
        )

        def sort_value(row):

            value = row.get(key)

            if value is None:
                return float("inf")

            return value

        rows.sort(
            key=sort_value,
            reverse=(sort_order == "desc")
        )

        return {
            "items": rows,
            "total": len(rows)
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Forecast calculation failed: {str(exc)}"
        )


@router.get("/recommendations")
def inventory_recommendations(
    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        rows = get_recommendations(
            db,
            current_user,
            forecast_days
        )

        return {
            "items": rows,
            "total": len(rows)
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Recommendation calculation failed: {str(exc)}"
        )


@router.get("/recommendations/{product_id}")
def product_recommendation(
    product_id: int,

    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        result = get_product_recommendation(
            db,
            current_user,
            product_id,
            forecast_days
        )

        if not result:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        return result

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Recommendation calculation failed: {str(exc)}"
        )


@router.get("/forecast/summary")
def inventory_forecast_summary(
    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return get_forecast_summary(
            db,
            current_user,
            forecast_days
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Summary calculation failed: {str(exc)}"
        )


@router.get("/forecast/chart")
def inventory_forecast_chart(
    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        return {
            "items": get_forecast_chart(
                db,
                current_user,
                forecast_days
            )
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Chart data calculation failed: {str(exc)}"
        )