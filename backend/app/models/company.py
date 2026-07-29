from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    industry = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False,
        unique=True
    )

    address = Column(
        String,
        nullable=False
    )

    phone = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    users = relationship(
        "User",
        back_populates="company"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="company",
        cascade="all, delete"
    )

    categories = relationship(
        "Category",
        back_populates="company",
        cascade="all, delete"
    )

    products = relationship(
        "Product",
        back_populates="company",
        cascade="all, delete"
    )

    notifications = relationship(
        "Notification",
        back_populates="company"
    )

    customers = relationship(
        "Customer",
        back_populates="company"
    )





