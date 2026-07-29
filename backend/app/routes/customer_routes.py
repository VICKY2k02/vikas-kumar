from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.schemas.customer_schema import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse
)

from app.services.customer.customer_segmentation_service import (
    get_customer_segments
)

from app.services.customer.customer_service import (
    create_customer,
    get_customers,
    get_customer,
    update_customer,
    delete_customer,
    change_status,
    get_customer_analytics
)

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


# ------------------------------------
# Get All Customers
# ------------------------------------
@router.get("/",response_model=list[CustomerResponse]
)
def customers(

    search: str | None = Query(None),

    customer_type: str | None = Query(None),

    status: str | None = Query(None),

    city: str | None = Query(None),

    state: str | None = Query(None),

    country: str | None = Query(None),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

    

):



    return get_customers(

        db=db,

        current_user=current_user,

        search=search,

        customer_type=customer_type,

        status=status,

        city=city,

        state=state,

        country=country

    )

    print(result)

    return result




# ------------------------------------
# Customer Analytics
# ------------------------------------
@router.get("/analytics")
def analytics(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    return get_customer_analytics(

        db,

        current_user

    )



# Customer Segments

@router.get("/segments")
def customer_segments(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    return get_customer_segments(
        db,
        current_user
    )

# ------------------------------------
# Get Single Customer
# ------------------------------------
@router.get(
    "/{customer_id}",
    response_model=CustomerResponse
)
def customer(

    customer_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    obj = get_customer(
        db,
        customer_id,
        current_user
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return obj
    
# ------------------------------------
# Create Customer
# ------------------------------------
@router.post(
    "/",
    response_model=CustomerResponse
)
def create(

    customer: CustomerCreate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    try:

        return create_customer(
            db,
            customer,
            current_user
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ------------------------------------
# Update Customer
# ------------------------------------
@router.put(
    "/{customer_id}",
    response_model=CustomerResponse
)
def update(

    customer_id: int,

    data: CustomerUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    obj = update_customer(

        db,

        customer_id,

        data,

        current_user

    )

    if not obj:

        raise HTTPException(

            status_code=404,

            detail="Customer not found"

        )

    return obj





# ------------------------------------
# Activate / Deactivate
# ------------------------------------
@router.patch(
    "/{customer_id}/status"
)
def status(

    customer_id: int,

    status: str,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin"
        )
    )

):

    obj = change_status(

        db,

        customer_id,

        status,

        current_user

    )

    if not obj:

        raise HTTPException(

            status_code=404,

            detail="Customer not found"

        )

    return {

        "message": f"Customer {status}"

    }


# ------------------------------------
# Delete Customer
# ------------------------------------
@router.delete("/{customer_id}")
def delete(

    customer_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin"
        )
    )

):

    ok = delete_customer(

        db,

        customer_id,

        current_user

    )

    if not ok:

        raise HTTPException(

            status_code=404,

            detail="Customer not found"

        )

    return {

        "message": "Customer deleted successfully"

    }
