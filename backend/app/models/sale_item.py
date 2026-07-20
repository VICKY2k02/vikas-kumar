from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class SaleItem(Base):

    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)

    sale_id = Column(
        Integer,
        ForeignKey("sales.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id")
    )

    quantity = Column(Integer)

    unit_price = Column(Float)

    discount = Column(Float)

    tax = Column(Float)

    total = Column(Float)

    sale = relationship(
        "Sale",
        back_populates="items"
    )