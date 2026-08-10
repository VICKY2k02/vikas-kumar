from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.schemas.order_schema import (
    OrderCreate,
    OrderUpdate,
    OrderResponse
)

from app.services.order_service import (
    create_order,
    get_orders,
    get_order,
    update_order,
    delete_order
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# ---------------------------------------
# Create Order
# ---------------------------------------
@router.post(
    "/",
    response_model=OrderResponse
)
def create(

    order: OrderCreate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst",
            "Sales Executive"
        )
    )

):

    return create_order(
        db,
        order,
        current_user
    )


# ---------------------------------------
# Get Orders
# ---------------------------------------
@router.get(
    "/",
    response_model=list[OrderResponse]
)
def orders(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst",
            "Sales Executive"
        )
    )

):

    return get_orders(
        db,
        current_user
    )


# ---------------------------------------
# Get Single Order
# ---------------------------------------
@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def order(

    order_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst",
            "Sales Executive"
        )
    )

):

    obj = get_order(
        db,
        order_id,
        current_user
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Order Not Found"
        )

    return obj


# ---------------------------------------
# Update Order
# ---------------------------------------
@router.put(
    "/{order_id}",
    response_model=OrderResponse
)
def update(

    order_id: int,

    data: OrderUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst",
            "Sales Executive"
        )
    )

):

    obj = update_order(
        db,
        order_id,
        data,
        current_user
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Order Not Found"
        )

    return obj


# ---------------------------------------
# Delete Order
# ---------------------------------------
@router.delete("/{order_id}")
def delete(

    order_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst",
            "Sales Executive"
        )
    )

):

    ok = delete_order(
        db,
        order_id,
        current_user
    )

    if not ok:
        raise HTTPException(
            status_code=404,
            detail="Order Not Found"
        )

    return {
        "message": "Order Deleted Successfully"
    }