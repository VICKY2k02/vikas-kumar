from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from io import StringIO
import csv

from app.models.audit_log import AuditLog
from app.core.database import get_db
from app.core.dependencies import require_roles

from app.services.forecast_service import (
    generate_product_forecasts,
    get_product_forecasts,
    get_category_forecasts,
    dashboard_summary
)

router = APIRouter(
    prefix="/forecast",
    tags=["Demand Forecast"]
)


# -----------------------------------------
# Generate Forecast
# -----------------------------------------
@router.post("/generate")
def generate_forecast(

    period: int = Query(30),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    forecasts = generate_product_forecasts(

        db,

        current_user,

        period

    )

    return {

        "message": "Forecast generated successfully",

        "count": len(forecasts)

    }


# -----------------------------------------
# Refresh Forecast
# -----------------------------------------
@router.post("/refresh")
def refresh_forecast(

    period: int = Query(30),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    forecasts = generate_product_forecasts(

        db,

        current_user,

        period

    )


    db.add(

        AuditLog(

            company_id=current_user.company_id,

            action="Forecast Refreshed",

            module="Demand Forecast",

            description=f"{period} Days Forecast",

            performed_by=current_user.email

        )

    )

    db.commit()

    return {

        "message": "Forecast refreshed successfully",

        "count": len(forecasts)

    }


# -----------------------------------------
# Product Forecast
# -----------------------------------------
@router.get("/products")
def product_forecasts(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    return get_product_forecasts(

        db,

        current_user

    )


# -----------------------------------------
# Category Forecast
# -----------------------------------------
@router.get("/categories")
def category_forecasts(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    return get_category_forecasts(

        db,

        current_user

    )


# -----------------------------------------
# Dashboard KPI
# -----------------------------------------
@router.get("/dashboard")
def dashboard(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    return dashboard_summary(

        db,

        current_user

    )

# -----------------------------------------
# Export Forecast
# -----------------------------------------
@router.get("/export/{report}")
def export_forecast(

    report: str,

    format: str = Query("csv"),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )

):

    # Product Forecast Data
    if report in ["forecast", "product", "products"]:
        data = get_product_forecasts(db, current_user)

    elif report in ["category", "categories"]:
        data = get_category_forecasts(db, current_user)

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid report type"
    )

    # -------------------------
    # Audit Log
    # -------------------------

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            action="Forecast Exported",

            module="Demand Forecast",

            description=f"{report} ({format})",

            performed_by=current_user.email

        )

    )

    db.commit()

    # -------------------------
    # CSV Export
    # -------------------------

    output = StringIO()

    writer = csv.writer(output)

    if data:
        writer.writerow(data[0].keys())

        for row in data:
            writer.writerow(row.values())

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={report}.csv"
        }
    )