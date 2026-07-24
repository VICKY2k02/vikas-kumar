from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_revenue: float
    total_orders: int
    total_products_sold: int
    average_order_value: float
    total_inventory_value: float
    low_stock_products: int
    out_of_stock_products: int
    total_categories: int


class DashboardResponse(BaseModel):
    summary: DashboardSummary