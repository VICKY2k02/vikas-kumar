from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Sale(Base):

    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"))

    invoice_number = Column(String, unique=True, nullable=False)

    customer_name = Column(String)

    sale_date = Column(DateTime, default=datetime.utcnow)

    sales_channel = Column(String)

    payment_method = Column(String)

    total_amount = Column(Float)

    created_by = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete"
    )