from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str

    gender: Optional[str] = None
    date_of_birth: Optional[date] = None

    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    postal_code: Optional[str] = None

    customer_type: str
    preferred_sales_channel: Optional[str] = None


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    gender: Optional[str] = None
    date_of_birth: Optional[date] = None

    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    postal_code: Optional[str] = None

    customer_type: Optional[str] = None
    preferred_sales_channel: Optional[str] = None
    status: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    company_id: int

    customer_id: str

    full_name: str
    email: str
    phone: str

    gender: Optional[str]
    date_of_birth: Optional[date]

    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]

    postal_code: Optional[str]


    customer_type: str
    preferred_sales_channel: Optional[str]

    purchase_summary: CustomerPurchaseSummaryResponse | None = None

    status: str

    created_at: datetime


    total_orders: int | None = 0

    total_revenue: float | None = 0

    average_order_value: float | None = 0

    purchase_frequency: float | None = 0

    last_purchase_date: datetime | None = None


class CustomerPurchaseSummaryResponse(BaseModel):

    total_orders: int
    total_revenue: float
    total_products_purchased: int
    average_order_value: float
    purchase_frequency: int
    first_purchase_date: datetime | None = None
    last_purchase_date: datetime | None = None
    total_products_purchased: int | None = 0
    # first_purchase_date: datetime | None = None
    
    class Config:
        from_attributes = True