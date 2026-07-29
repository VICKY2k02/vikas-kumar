from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        default=1
    )

    unit_price = Column(
        Float,
        default=0
    )

    total_price = Column(
        Float,
        default=0
    )

    order = relationship(
        "Order",
        back_populates="items"
    )

    product = relationship(
        "Product",
        back_populates="items"
    )