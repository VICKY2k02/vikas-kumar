from pydantic import BaseModel
from datetime import datetime


class ForecastResponse(BaseModel):

    id: int

    product_id: int

    category_id: int

    forecast_period: str

    predicted_demand: float

    confidence_score: float

    generated_at: datetime

    class Config:

        from_attributes = True