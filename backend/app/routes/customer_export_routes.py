from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import StringIO, BytesIO
import csv

from reportlab.platypus import SimpleDocTemplate, Table
from reportlab.lib import colors
from reportlab.platypus.tables import TableStyle

from app.core.database import get_db
from app.core.dependencies import require_roles

from app.models.customer.customer import Customer
from app.models.customer.customer_purchase_summary import CustomerPurchaseSummary


router = APIRouter(
    prefix="/customers/export",
    tags=["Customer Export"]
)


@router.get("/list")
def export_customer_list(
    format: str = Query("csv"),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):




    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Customer ID",
        "Name",
        "Email",
        "Phone",
        "Type",
        "City",
        "Status"
    ])

    customers = (
        db.query(Customer)
        .filter(
            Customer.company_id ==
            current_user.company_id
        )
        .all()
    )

    for c in customers:

        writer.writerow([
            c.customer_id,
            c.full_name,
            c.email,
            c.phone,
            c.customer_type,
            c.city,
            c.status
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=customers.csv"
        }
    )


@router.get("/analytics")
def export_customer_analytics(
    format: str = Query("csv"),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    total_customers = (
        db.query(Customer)
        .filter(
            Customer.company_id == current_user.company_id
        )
        .count()
    )

    active_customers = (
        db.query(Customer)
        .filter(
            Customer.company_id == current_user.company_id,
            Customer.status == "Active"
        )
        .count()
    )

    inactive_customers = total_customers - active_customers

    summaries = (
        db.query(CustomerPurchaseSummary)
        .join(
            Customer,
            Customer.id == CustomerPurchaseSummary.customer_id
        )
        .filter(
            Customer.company_id == current_user.company_id
        )
        .all()
    )

    total_revenue = sum(
        s.total_revenue or 0
        for s in summaries
    )

    average_spend = (
        total_revenue / total_customers
        if total_customers else 0
    )

    average_frequency = (
        sum(
            s.purchase_frequency or 0
            for s in summaries
        ) / len(summaries)
        if summaries else 0
    )

    if format == "pdf":

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        data = [

            ["Metric", "Value"],

            ["Total Customers", total_customers],

            ["Active Customers", active_customers],

            ["Inactive Customers", inactive_customers],

            ["Total Revenue", total_revenue],

            ["Average Customer Spend", average_spend],

            ["Average Purchase Frequency", average_frequency]

        ]

        table = Table(data)

        table.setStyle(TableStyle([

            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),

            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),

            ("GRID", (0, 0), (-1, -1), 1, colors.black),

            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

            ("ALIGN", (0, 0), (-1, -1), "CENTER"),

            ("BOTTOMPADDING", (0, 0), (-1, 0), 10)

        ]))

        doc.build([table])

        buffer.seek(0)

        return StreamingResponse(

            buffer,

            media_type="application/pdf",

            headers={

                "Content-Disposition":
                "attachment; filename=customer_analytics.pdf"

            }

        )

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Metric",
        "Value"
    ])

    writer.writerow([
        "Total Customers",
        total_customers
    ])

    writer.writerow([
        "Active Customers",
        active_customers
    ])

    writer.writerow([
        "Inactive Customers",
        inactive_customers
    ])

    writer.writerow([
        "Total Revenue",
        total_revenue
    ])

    writer.writerow([
        "Average Customer Spend",
        average_spend
    ])

    writer.writerow([
        "Average Purchase Frequency",
        average_frequency
    ])

    output.seek(0)

    return StreamingResponse(

        iter([output.getvalue()]),

        media_type="text/csv",

        headers={

            "Content-Disposition":
            "attachment; filename=customer_analytics.csv"

        }

    )


@router.get("/top-customers")
def export_top_customers(
    format: str = Query("csv"),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Company Admin",
            "Analyst"
        )
    )
):

    customers = (
        db.query(
            Customer,
            CustomerPurchaseSummary
        )
        .join(
            CustomerPurchaseSummary,
            Customer.id ==
            CustomerPurchaseSummary.customer_id
        )
        .filter(
            Customer.company_id ==
            current_user.company_id
        )
        .order_by(
            CustomerPurchaseSummary.total_revenue.desc()
        )
        .limit(10)
        .all()
    )

    if format == "pdf":

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        data = [[

            "Customer ID",

            "Customer Name",

            "Orders",

            "Revenue",

            "Average Order"

        ]]

        for customer, summary in customers:

            data.append([

                customer.customer_id,

                customer.full_name,

                summary.total_orders,

                summary.total_revenue,

                summary.average_order_value

            ])

        table = Table(data)

        table.setStyle(TableStyle([

            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),

            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),

            ("GRID", (0, 0), (-1, -1), 1, colors.black),

            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

            ("ALIGN", (0, 0), (-1, -1), "CENTER"),

            ("BOTTOMPADDING", (0, 0), (-1, 0), 10)

        ]))

        doc.build([table])

        buffer.seek(0)

        return StreamingResponse(

            buffer,

            media_type="application/pdf",

            headers={

                "Content-Disposition":
                "attachment; filename=top_customers.pdf"

            }

        )

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Customer ID",
        "Customer Name",
        "Total Orders",
        "Revenue",
        "Average Order Value"
    ])

    for customer, summary in customers:

        writer.writerow([

            customer.customer_id,

            customer.full_name,

            summary.total_orders,

            summary.total_revenue,

            summary.average_order_value

        ])

    output.seek(0)

    return StreamingResponse(

        iter([output.getvalue()]),

        media_type="text/csv",

        headers={

            "Content-Disposition":
            "attachment; filename=top_customers.csv"

        }

    )




















