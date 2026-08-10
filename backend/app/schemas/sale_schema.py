from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


# ------------------------------------------------------------------
# Sale Item (one product line inside an invoice)
# ------------------------------------------------------------------
class SaleItemCreate(BaseModel):

    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0
    tax: float = 0

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v

    @field_validator("unit_price")
    @classmethod
    def unit_price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Unit price must be greater than zero")
        return v

    @field_validator("discount", "tax")
    @classmethod
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("Discount/Tax cannot be negative")
        return v


class SaleItemResponse(BaseModel):

    id: int
    product_id: int
    product_name: Optional[str] = None
    sku: Optional[str] = None
    category_name: Optional[str] = None
    quantity: int
    unit_price: float
    discount: float
    tax: float
    total: float

    class Config:
        from_attributes = True


# ------------------------------------------------------------------
# Sale (the invoice)
# ------------------------------------------------------------------
class SaleCreate(BaseModel):

    customer_id: int
    items: list[SaleItemCreate]
    payment_method: str
    sales_channel: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "Paid"

    @field_validator("items")
    @classmethod
    def at_least_one_item(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one product is required")
        return v


class SaleUpdate(BaseModel):

    customer_id: Optional[int] = None
    items: Optional[list[SaleItemCreate]] = None
    payment_method: Optional[str] = None
    sales_channel: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class SaleResponse(BaseModel):

    id: int
    invoice_number: str

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None

    sale_date: datetime

    sales_channel: Optional[str] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

    salesperson_name: Optional[str] = None

    subtotal: float = 0
    discount: float = 0
    tax: float = 0
    total_amount: float = 0

    item_count: int = 0
    items: list[SaleItemResponse] = []

    created_at: datetime

    class Config:
        from_attributes = True