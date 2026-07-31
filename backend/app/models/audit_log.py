from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.core.database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    action = Column(
        String,
        nullable=False
    )

    ip_address = Column(
        String
    )

    browser = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    company = relationship(
        "Company",
        back_populates="audit_logs"
    )

    user = relationship(
        "User",
        back_populates="audit_logs"
    )

    invoice_number = Column(String, nullable=True)

    product_name = Column(String, nullable=True)

    module = Column(String)

    description = Column(String)

    performed_by = Column(String)