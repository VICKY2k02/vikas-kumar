from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Sale(Base):

    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    company_id = Column(
        Integer,
        nullable=False
    )
 
    invoice_number = Column(
        String,
        nullable=False,
        unique=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=True
    )

    customer_name = Column(
        String,
        nullable=True
    )

    sale_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    sales_channel = Column(
        String,
        nullable=True
    )

    payment_method = Column(
        String,
        nullable=True
    )
 
    status = Column(
        String,
        default="Paid"
    )
 
    discount = Column(
        Float,
        default=0
    )

    tax = Column(
        Float,
        default=0
    )

    subtotal = Column(
        Float,
        default=0
    )

    total_amount = Column(
        Float,
        default=0
    )

   
    notes = Column(
        String,
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

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
 
    salesperson = relationship("User")