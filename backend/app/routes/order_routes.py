from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.schemas.order_schema import (
    OrderCreate,
    OrderResponse
)

from app.services.order_service import (
    create_order,
    get_orders
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