from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_roles
)

from app.schemas.inventory_schema import (
    InventoryCreate,
    InventoryUpdate,
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
    get_inventory_movements
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post("/")
def create_new_inventory(

    data: InventoryCreate,

    db: Session = Depends(get_db),

    current_user = Depends(
        require_roles(
            "Company Admin"
        )
    )

):

    return create_inventory(
        db,
        data,
        current_user
    )


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

        db,

        current_user

    )



@router.get("/{inventory_id}/movements")
def inventory_movement_history(

    inventory_id: int,

    db: Session = Depends(get_db),

    current_user = Depends(
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






    

@router.get("/{inventory_id}")
def get_inventory_details(

    inventory_id: int,

    db: Session = Depends(get_db),

    current_user = Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    return get_inventory_by_id(

        db,

        inventory_id,

        current_user

    )



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



@router.put("/{inventory_id}/reorder-level")
async def update_inventory_reorder_level(
    request: Request,
    inventory_id: int,
    data: ReorderLevelSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Company Admin"))
):
    print(await request.json())

    return update_reorder_level(
        db=db,
        inventory_id=inventory_id,
        reorder_level=data.reorder_level,
        current_user=current_user
    )