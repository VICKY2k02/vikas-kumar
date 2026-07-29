from pydantic import BaseModel


class OrderItemCreate(BaseModel):

    product_id: int

    quantity: int

    unit_price: float


class OrderItemResponse(OrderItemCreate):

    id: int

    total_price: float

    class Config:

        from_attributes = True