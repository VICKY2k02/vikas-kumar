from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrderCreate(BaseModel):

    customer_id: int
    total_amount: float
    total_quantity: int
    payment_method: str
    status: str


class OrderUpdate(BaseModel):

    total_amount: Optional[float] = None
    total_quantity: Optional[int] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None


class OrderResponse(BaseModel):

    id: int
    customer_id: int
    customer_name: Optional[str] = None

    total_amount: float
    total_quantity: int

    payment_method: str
    status: str

    created_at: datetime

    class Config:
        from_attributes = True