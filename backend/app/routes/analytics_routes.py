from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.services.analytics_service import get_dashboard

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/dashboard")
def dashboard(

    start_date: str | None = None,
    end_date: str | None = None,
    category: int | None = None,
    brand: str | None = None,
    payment_method: str | None = None,
    sales_channel: str | None = None,

    db: Session = Depends(get_db),

    current_user=Depends(

        require_roles(

            "Company Admin",

            "Analyst"

        )

    )

):

    return get_dashboard(

        db=db,

        current_user=current_user,

        start_date=start_date,

        end_date=end_date,

        category=category,

        brand=brand,

        payment_method=payment_method,

        sales_channel=sales_channel

    )