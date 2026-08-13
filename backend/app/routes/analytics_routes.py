from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from fastapi.responses import StreamingResponse

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

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


# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard")
def dashboard(

    start_date: str | None = None,
    end_date: str | None = None,
    category: int | None = None,
    brand: str | None = None,
    product: int | None = None,
    customer: str | None = None,
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
        product=product,
        customer=customer,
        payment_method=payment_method,
        sales_channel=sales_channel
    )


# ============================================================
# ANALYTICS EXPORT
# ============================================================

@router.get("/export/{format}")
def export_analytics(

    request: Request,

    format: str,

    start_date: str | None = None,
    end_date: str | None = None,
    category: int | None = None,
    brand: str | None = None,
    product: int | None = None,
    customer: str | None = None,
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

    # --------------------------------------------------------
    # Validate format
    # --------------------------------------------------------

    format = format.lower()

    if format not in ["csv", "pdf"]:

        raise HTTPException(
            status_code=400,
            detail="Only CSV and PDF exports are supported."
        )


    # --------------------------------------------------------
    # Get filtered analytics
    # --------------------------------------------------------

    data = get_dashboard(

        db=db,

        current_user=current_user,

        start_date=start_date,

        end_date=end_date,

        category=category,

        brand=brand,

        product=product,

        customer=customer,

        payment_method=payment_method,

        sales_channel=sales_channel

    )


    # ========================================================
    # AUDIT LOG
    # ========================================================

    ip = (
        request.client.host
        if request.client
        else None
    )

    user_agent = request.headers.get(
        "user-agent",
        ""
    )

    browser = get_browser(user_agent)


    audit = AuditLog(

        company_id=current_user.company_id,

        user_id=current_user.id,

        action="Analytics Export",

        module="Analytics",

        description=(
            f"Exported Analytics Report "
            f"({format.upper()})"
        ),

        performed_by=current_user.email,

        ip_address=ip,

        browser=browser

    )

    db.add(audit)

    db.commit()


    # ========================================================
    # CSV EXPORT
    # ========================================================

    if format == "csv":

        output = StringIO()

        writer = csv.writer(output)


        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        writer.writerow(
            ["RETAIL SALES ANALYTICS REPORT"]
        )

        writer.writerow([])


        # ----------------------------------------------------
        # FILTERS
        # ----------------------------------------------------

        writer.writerow(
            ["FILTERS"]
        )

        writer.writerow(
            ["Start Date", start_date or "All"]
        )

        writer.writerow(
            ["End Date", end_date or "All"]
        )

        writer.writerow(
            ["Category", category or "All"]
        )

        writer.writerow(
            ["Brand", brand or "All"]
        )

        writer.writerow(
            ["Product", product or "All"]
        )

        writer.writerow(
            ["Customer", customer or "All"]
        )

        writer.writerow(
            ["Payment Method",
             payment_method or "All"]
        )

        writer.writerow(
            ["Sales Channel",
             sales_channel or "All"]
        )

        writer.writerow([])


        # ====================================================
        # KPI SUMMARY
        # ====================================================

        writer.writerow(
            ["KPI SUMMARY"]
        )

        writer.writerow(
            ["Metric", "Value"]
        )


        summary = data.get(
            "summary",
            {}
        )


        for key, value in summary.items():

            writer.writerow([
                key,
                value
            ])


        writer.writerow([])


        # ====================================================
        # DAILY REVENUE
        # ====================================================

        writer.writerow(
            ["DAILY REVENUE"]
        )

        writer.writerow(
            ["Date", "Revenue"]
        )


        for row in data.get(
            "daily_revenue",
            []
        ):

            writer.writerow([
                row.get("date"),
                row.get("revenue", 0)
            ])


        writer.writerow([])


        # ====================================================
        # WEEKLY REVENUE
        # ====================================================

        writer.writerow(
            ["WEEKLY REVENUE"]
        )

        writer.writerow(
            ["Period", "Revenue"]
        )


        for row in data.get(
            "weekly_revenue",
            []
        ):

            writer.writerow([
                row.get("period"),
                row.get("revenue", 0)
            ])


        writer.writerow([])


        # ====================================================
        # MONTHLY REVENUE
        # ====================================================

        writer.writerow(
            ["MONTHLY REVENUE"]
        )

        writer.writerow(
            ["Period", "Revenue"]
        )


        for row in data.get(
            "monthly_revenue",
            []
        ):

            writer.writerow([
                row.get("period"),
                row.get("revenue", 0)
            ])


        writer.writerow([])


        # ====================================================
        # SALES VS ORDERS
        # ====================================================

        writer.writerow(
            ["SALES VS ORDERS"]
        )

        writer.writerow(
            ["Date", "Revenue", "Orders"]
        )


        for row in data.get(
            "sales_vs_orders",
            []
        ):

            writer.writerow([
                row.get("date"),
                row.get("revenue", 0),
                row.get("orders", 0)
            ])


        writer.writerow([])


        # ====================================================
        # TOP PRODUCTS
        # ====================================================

        writer.writerow(
            ["TOP PRODUCTS"]
        )

        writer.writerow(
            [
                "Product",
                "Quantity",
                "Revenue"
            ]
        )


        for row in data.get(
            "top_products",
            []
        ):

            writer.writerow([
                row.get("product"),
                row.get("quantity", 0),
                row.get("revenue", 0)
            ])


        writer.writerow([])


        # ====================================================
        # TOP CUSTOMERS
        # ====================================================

        writer.writerow(
            ["TOP CUSTOMERS"]
        )

        writer.writerow(
            [
                "Customer",
                "Orders",
                "Total Spend",
                "Average Order Value"
            ]
        )


        for row in data.get(
            "top_customers",
            []
        ):

            writer.writerow([
                row.get("customer"),
                row.get("orders", 0),
                row.get("total_spend", 0),
                row.get(
                    "average_order_value",
                    0
                )
            ])


        writer.writerow([])


        # ====================================================
        # PAYMENT METHOD
        # ====================================================

        writer.writerow(
            ["PAYMENT METHOD ANALYSIS"]
        )

        writer.writerow(
            [
                "Payment Method",
                "Transactions",
                "Revenue"
            ]
        )


        for row in data.get(
            "payment_method_analysis",
            []
        ):

            writer.writerow([
                row.get(
                    "payment_method"
                ),

                row.get(
                    "transactions",
                    0
                ),

                row.get(
                    "revenue",
                    0
                )
            ])


        writer.writerow([])


        # ====================================================
        # CATEGORY
        # ====================================================

        writer.writerow(
            ["CATEGORY DISTRIBUTION"]
        )

        writer.writerow(
            [
                "Category",
                "Quantity"
            ]
        )


        for row in data.get(
            "category_distribution",
            []
        ):

            writer.writerow([
                row.get("category"),
                row.get("value", 0)
            ])


        writer.writerow([])


        # ====================================================
        # INVENTORY
        # ====================================================

        writer.writerow(
            ["INVENTORY STATUS"]
        )

        writer.writerow(
            [
                "Status",
                "Count"
            ]
        )


        for row in data.get(
            "inventory_status_distribution",
            []
        ):

            writer.writerow([
                row.get("status"),
                row.get("count", 0)
            ])


        # ----------------------------------------------------
        # Return CSV
        # ----------------------------------------------------

        output.seek(0)


        return StreamingResponse(

            iter([
                output.getvalue()
            ]),

            media_type="text/csv",

            headers={
                "Content-Disposition":
                "attachment; "
                "filename=sales_analytics.csv"
            }

        )


    # ========================================================
    # PDF EXPORT
    # ========================================================

    if format == "pdf":

        buffer = BytesIO()

        pdf = canvas.Canvas(
            buffer,
            pagesize=A4
        )


        width, height = A4

        y = height - 50


        # ----------------------------------------------------
        # Helper function
        # ----------------------------------------------------

        def draw_title(title):

            nonlocal y

            if y < 80:

                pdf.showPage()

                y = height - 50


            pdf.setFont(
                "Helvetica-Bold",
                14
            )

            pdf.setFillColor(
                colors.darkblue
            )

            pdf.drawString(
                40,
                y,
                title
            )

            y -= 25

            pdf.setFillColor(
                colors.black
            )


        def draw_row(text):

            nonlocal y

            if y < 50:

                pdf.showPage()

                y = height - 50


            pdf.setFont(
                "Helvetica",
                9
            )

            pdf.drawString(
                45,
                y,
                str(text)
            )

            y -= 15


        # ====================================================
        # REPORT TITLE
        # ====================================================

        pdf.setFont(
            "Helvetica-Bold",
            20
        )

        pdf.setFillColor(
            colors.darkblue
        )

        pdf.drawString(
            40,
            y,
            "Retail Sales Analytics Report"
        )

        y -= 30


        pdf.setFont(
            "Helvetica",
            9
        )

        pdf.setFillColor(
            colors.black
        )

        pdf.drawString(
            40,
            y,
            f"Generated by: "
            f"{current_user.email}"
        )

        y -= 15


        pdf.drawString(
            40,
            y,
            f"Date Range: "
            f"{start_date or 'All'} "
            f"to "
            f"{end_date or 'All'}"
        )

        y -= 30


        # ====================================================
        # KPI SUMMARY
        # ====================================================

        draw_title(
            "KPI SUMMARY"
        )


        summary = data.get(
            "summary",
            {}
        )


        for key, value in summary.items():

            draw_row(
                f"{key}: {value}"
            )


        y -= 10


        # ====================================================
        # DAILY REVENUE
        # ====================================================

        draw_title(
            "DAILY REVENUE"
        )


        for row in data.get(
            "daily_revenue",
            []
        ):

            draw_row(
                f"{row.get('date')}   "
                f"Revenue: ₹"
                f"{row.get('revenue', 0):,.2f}"
            )


        y -= 10


        # ====================================================
        # WEEKLY REVENUE
        # ====================================================

        draw_title(
            "WEEKLY REVENUE"
        )


        for row in data.get(
            "weekly_revenue",
            []
        ):

            draw_row(
                f"{row.get('period')}   "
                f"Revenue: ₹"
                f"{row.get('revenue', 0):,.2f}"
            )


        y -= 10


        # ====================================================
        # MONTHLY REVENUE
        # ====================================================

        draw_title(
            "MONTHLY REVENUE"
        )


        for row in data.get(
            "monthly_revenue",
            []
        ):

            draw_row(
                f"{row.get('period')}   "
                f"Revenue: ₹"
                f"{row.get('revenue', 0):,.2f}"
            )


        y -= 10


        # ====================================================
        # SALES VS ORDERS
        # ====================================================

        draw_title(
            "SALES VS ORDERS"
        )


        for row in data.get(
            "sales_vs_orders",
            []
        ):

            draw_row(
                f"{row.get('date')}   "
                f"Revenue: ₹"
                f"{row.get('revenue', 0):,.2f}   "
                f"Orders: {row.get('orders', 0)}"
            )


        y -= 10


        # ====================================================
        # TOP PRODUCTS
        # ====================================================

        draw_title(
            "TOP PRODUCTS"
        )


        for row in data.get(
            "top_products",
            []
        ):

            draw_row(
                f"{row.get('product')}   "
                f"Units: {row.get('quantity', 0)}   "
                f"Revenue: ₹"
                f"{row.get('revenue', 0):,.2f}"
            )


        y -= 10


        # ====================================================
        # TOP CUSTOMERS
        # ====================================================

        draw_title(
            "TOP CUSTOMERS"
        )


        for row in data.get(
            "top_customers",
            []
        ):

            draw_row(
                f"{row.get('customer')}   "
                f"Orders: {row.get('orders', 0)}   "
                f"Spend: ₹"
                f"{row.get('total_spend', 0):,.2f}   "
                f"AOV: ₹"
                f"{row.get('average_order_value', 0):,.2f}"
            )


        y -= 10


        # ====================================================
        # PAYMENT METHOD
        # ====================================================

        draw_title(
            "PAYMENT METHOD ANALYSIS"
        )


        for row in data.get(
            "payment_method_analysis",
            []
        ):

            draw_row(
                f"{row.get('payment_method')}   "
                f"Transactions: "
                f"{row.get('transactions', 0)}   "
                f"Revenue: ₹"
                f"{row.get('revenue', 0):,.2f}"
            )


        y -= 10


        # ====================================================
        # CATEGORY
        # ====================================================

        draw_title(
            "CATEGORY DISTRIBUTION"
        )


        for row in data.get(
            "category_distribution",
            []
        ):

            draw_row(
                f"{row.get('category')}   "
                f"Quantity: "
                f"{row.get('value', 0)}"
            )


        y -= 10


        # ====================================================
        # INVENTORY
        # ========================================================

        draw_title(
            "INVENTORY STATUS"
        )


        for row in data.get(
            "inventory_status_distribution",
            []
        ):

            draw_row(
                f"{row.get('status')}   "
                f"Count: "
                f"{row.get('count', 0)}"
            )


        # ====================================================
        # FINALIZE PDF
        # ====================================================

        pdf.save()

        buffer.seek(0)


        return StreamingResponse(

            buffer,

            media_type="application/pdf",

            headers={
                "Content-Disposition":
                "attachment; "
                "filename=sales_analytics.pdf"
            }

        )