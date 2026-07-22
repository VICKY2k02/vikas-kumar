from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from datetime import datetime

from app.core.database import Base


class Inventory(Base):

    __tablename__ = "inventory"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    company_id = Column(Integer)

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    current_stock = Column(
        Integer,
        default=0
    )

    reserved_stock = Column(
        Integer,
        default=0
    )

    available_stock = Column(
        Integer,
        default=0
    )

    reorder_level = Column(
        Integer,
        default=5
    )

    stock_status = Column(
        String,
        default="In Stock"
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )