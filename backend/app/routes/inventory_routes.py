from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.schemas.inventory_schema import (
    InventoryCreate,
    StockAdjustmentSchema,
    ReorderLevelSchema
)

from app.services.inventory_service import (
    create_inventory,
    get_all_inventory,
    get_inventory_by_id,
    add_stock,
    remove_stock,
    adjust_stock,
    update_reorder_level,
    inventory_dashboard,
    get_inventory_movements,

    calculate_inventory_forecast,
    get_inventory_recommendations,
    get_inventory_recommendation,
    inventory_forecast_summary,
    get_forecast_chart
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


# ============================================================
# CREATE INVENTORY
# ============================================================

@router.post("/")
def create_new_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Company Admin")
    )
):

    return create_inventory(
        db=db,
        data=data,
        current_user=current_user
    )


# ============================================================
# GET ALL INVENTORY
# ============================================================

@router.get("/")
def get_inventory(
    search: str = "",
    category: int | None = None,
    brand: str = "",
    stock_status: str = "",
    sort_by: str = "updated_at",
    order: str = "desc",

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return get_all_inventory(
        db=db,
        current_user=current_user,
        search=search,
        category=category,
        brand=brand,
        stock_status=stock_status,
        sort_by=sort_by,
        order=order
    )


# ============================================================
# INVENTORY DASHBOARD
# ============================================================

@router.get("/dashboard")
def get_inventory_dashboard(
    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return inventory_dashboard(
        db=db,
        current_user=current_user
    )


# ============================================================
# INVENTORY FORECAST
# ============================================================

@router.get("/forecast")
def get_inventory_forecast_route(

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

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    result = calculate_inventory_forecast(

        db=db,

        current_user=current_user,

        forecast_days=forecast_days,

        search=search,

        category=category,

        risk=risk,

        reorder_required=reorder_required,

        sort_by=sort_by
    )

    # sort_order support
    if sort_order == "desc":
        result["items"].reverse()

    return result


# ============================================================
# INVENTORY RECOMMENDATIONS
# ============================================================

@router.get("/recommendations")
def get_recommendations_route(

    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return get_inventory_recommendations(

        db=db,

        current_user=current_user,

        forecast_days=forecast_days
    )


# ============================================================
# FORECAST SUMMARY
# ============================================================

@router.get("/forecast/summary")
def get_forecast_summary_route(

    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return inventory_forecast_summary(

        db=db,

        current_user=current_user,

        forecast_days=forecast_days
    )


# ============================================================
# FORECAST CHART
# ============================================================

@router.get("/forecast/chart")
def get_forecast_chart_route(

    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return {
        "items": get_forecast_chart(
            db=db,
            current_user=current_user,
            forecast_days=forecast_days
        )
    }


# ============================================================
# SINGLE PRODUCT RECOMMENDATION
# ============================================================

@router.get("/recommendations/{product_id}")
def get_product_recommendation_route(

    product_id: int,

    forecast_days: int = Query(
        30,
        ge=1,
        le=365
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return get_inventory_recommendation(

        db=db,

        current_user=current_user,

        product_id=product_id,

        forecast_days=forecast_days
    )


# ============================================================
# INVENTORY MOVEMENT HISTORY
# ============================================================

@router.get("/{inventory_id}/movements")
def inventory_movement_history(

    inventory_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return get_inventory_movements(

        db=db,

        current_user=current_user,

        inventory_id=inventory_id
    )


# ============================================================
# INVENTORY DETAILS
# ============================================================

@router.get("/{inventory_id}")
def get_inventory_details(

    inventory_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    return get_inventory_by_id(

        db=db,

        inventory_id=inventory_id,

        current_user=current_user
    )


# ============================================================
# ADD STOCK
# ============================================================

@router.patch("/{inventory_id}/add-stock")
def add_inventory_stock(

    inventory_id: int,

    data: StockAdjustmentSchema,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin"
        )
    )
):

    return add_stock(

        db=db,

        inventory_id=inventory_id,

        quantity=data.quantity,

        reason=data.reason,

        remarks=data.remarks,

        current_user=current_user
    )


# ============================================================
# REMOVE STOCK
# ============================================================

@router.patch("/{inventory_id}/remove-stock")
def remove_inventory_stock(

    inventory_id: int,

    data: StockAdjustmentSchema,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin"
        )
    )
):

    return remove_stock(

        db=db,

        inventory_id=inventory_id,

        quantity=data.quantity,

        reason=data.reason,

        remarks=data.remarks,

        current_user=current_user
    )


# ============================================================
# ADJUST STOCK
# ============================================================

@router.patch("/{inventory_id}/adjust-stock")
def manual_stock_adjustment(

    inventory_id: int,

    data: StockAdjustmentSchema,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin"
        )
    )
):

    return adjust_stock(

        db=db,

        inventory_id=inventory_id,

        adjustment_type=data.adjustment_type,

        quantity=data.quantity,

        reason=data.reason,

        remarks=data.remarks,

        current_user=current_user
    )


# ============================================================
# UPDATE REORDER LEVEL
# ============================================================

@router.put("/{inventory_id}/reorder-level")
async def update_inventory_reorder_level(

    request: Request,

    inventory_id: int,

    data: ReorderLevelSchema,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin"
        )
    )
):

    return update_reorder_level(

        db=db,

        inventory_id=inventory_id,

        reorder_level=data.reorder_level,

        current_user=current_user
    )