from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas
from io import BytesIO, StringIO
import csv

from app.services.audit_service import get_browser
from app.models.audit_log import AuditLog

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.services.analytics_service import get_dashboard

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/dashboard")
def dashboard(

    start_date: str | None = None,
    end_date: str | None = None,
    category: int | None = None,
    brand: str | None = None,
    payment_method: str | None = None,
    sales_channel: str | None = None,

    db: Session = Depends(get_db),

    current_user=Depends(

        require_roles(

            "Company Admin",

            "Analyst"

        )

    )

):

    return get_dashboard(

        db=db,

        current_user=current_user,

        start_date=start_date,

        end_date=end_date,

        category=category,

        brand=brand,

        payment_method=payment_method,

        sales_channel=sales_channel

    )

@router.get("/export/{format}")
def export_analytics(

    request: Request,
    format: str,

    start_date: str | None = None,
    end_date: str | None = None,
    category: int | None = None,
    brand: str |None = None,
    payment_method: str | None = None,
    sales_channel: str | None = None,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    data = get_dashboard(

        db=db,

        current_user=current_user,

        start_date=start_date,

        end_date=end_date,

        category=category,

        brand=brand,

        payment_method=payment_method,

        sales_channel=sales_channel

    )

    ip = request.client.host

    user_agent = request.headers.get("user-agent", "")

    browser = get_browser(user_agent)

    audit = AuditLog(
        company_id=current_user.company_id,
        user_id=current_user.id,
        action="Analytics Export",
        module="Analytics",
        description=f"Exported Analytics Report ({format.upper()})",
        performed_by=current_user.email,
        ip_address=ip,
        browser=browser
    )

    db.add(audit)
    db.commit()

    
    if format.lower() == "csv":

        output = StringIO()

        writer = csv.writer(output)

        writer.writerow(["Metric", "Value"])

        summary = data["summary"]

        for key, value in summary.items():
            writer.writerow([key, value])

        output.seek(0)

        return StreamingResponse(

            iter([output.getvalue()]),

            media_type="text/csv",

            headers={
                "Content-Disposition":
                "attachment; filename=analytics.csv"
            }

        )

    elif format.lower() == "pdf":

        buffer = BytesIO()

        pdf = canvas.Canvas(buffer)

        pdf.setFont("Helvetica-Bold", 16)

        pdf.drawString(180, 800, "Retail Analytics Report")

        pdf.setFont("Helvetica", 12)

        y = 760

        summary = data["summary"]

        for key, value in summary.items():

            pdf.drawString(
                50,
                y,
                f"{key} : {value}"
            )

            y -= 20

        pdf.save()

        buffer.seek(0)

        return StreamingResponse(

            buffer,

            media_type="application/pdf",

            headers={
                "Content-Disposition":
                "attachment; filename=analytics.pdf"
            }

        )

    return {"message": "Invalid format"}
















