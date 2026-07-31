from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey
)

from datetime import datetime

from app.core.database import Base


class DemandForecast(Base):

    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, nullable=False)

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id")
    )

    forecast_period = Column(String)

    predicted_demand = Column(Float, default=0)

    confidence_score = Column(Float, default=0)

    generated_at = Column(
        DateTime,
        default=datetime.utcnow
    )