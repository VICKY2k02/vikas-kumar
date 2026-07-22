from pydantic import BaseModel
from typing import Optional


# -----------------------------
# Inventory Create
# -----------------------------
class InventoryCreate(BaseModel):

    product_id: int

    current_stock: int

    reserved_stock: int = 0

    reorder_level: int = 5


# -----------------------------
# Inventory Update
# -----------------------------
class InventoryUpdate(BaseModel):

    current_stock: Optional[int] = None

    reserved_stock: Optional[int] = None

    reorder_level: Optional[int] = None


# -----------------------------
# Stock Adjustment
# -----------------------------
class StockAdjustmentSchema(BaseModel):

    adjustment_type: Optional[str] = None
    quantity: int
    reason: str
    remarks: Optional[str] = ""


# -----------------------------
# Inventory Response
# -----------------------------
class InventoryResponse(BaseModel):

    id: int

    product_id: int

    product_name: str

    sku: str

    category: str

    brand: str

    current_stock: int

    reserved_stock: int

    available_stock: int

    reorder_level: int

    stock_status: str

    updated_at: datetime

    class Config:

        from_attributes = True




# -----------------------------
# Inventory Dashboard
# -----------------------------
class InventoryDashboard(BaseModel):

    summary: dict

    inventory_by_category: list

    stock_status_distribution: list


# -----------------------------
# Inventory Movement Response
# -----------------------------
class InventoryMovementResponse(BaseModel):

    id: int

    inventory_id: int

    movement_type: str

    quantity_changed: int

    previous_quantity: int

    updated_quantity: int

    reason: str

    remarks: str

    performed_by: int

    created_at: datetime

    class Config:

        from_attributes = True


class ReorderLevelSchema(BaseModel):
    reorder_level: int
