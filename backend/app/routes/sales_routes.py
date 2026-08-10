from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from io import StringIO, BytesIO
import csv

from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus.tables import TableStyle

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.audit_log import AuditLog
from app.models.customer.customer import Customer
from app.models.notification import Notification
from app.models.inventory_movement import InventoryMovement

from app.schemas.sale_schema import (
    SaleCreate,
    SaleUpdate,
    SaleResponse,
    SaleItemResponse
)

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


 
def generate_invoice(db, company_id):

    for _ in range(5):

        count = db.query(Sale).filter(
            Sale.company_id == company_id
        ).count()

        candidate = f"INV-{datetime.now().year}-{str(count + 1).zfill(6)}"

        exists = db.query(Sale).filter(
            Sale.company_id == company_id,
            Sale.invoice_number == candidate
        ).first()

        if not exists:
            return candidate

    # Extremely unlikely fallback if 5 attempts all collided
    return f"INV-{datetime.now().year}-{int(datetime.utcnow().timestamp())}"


 
def build_sale_response(db: Session, sale: Sale) -> SaleResponse:

    items_out = []

    for item in sale.items:

        product = item.product
        category = item.category

        items_out.append(
            SaleItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=product.name if product else None,
                sku=getattr(product, "sku", None) if product else None,
                category_name=category.name if category else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount=item.discount or 0,
                tax=item.tax or 0,
                total=item.total or 0
            )
        )

    salesperson_name = None

    if sale.salesperson:
        salesperson_name = (
            getattr(sale.salesperson, "full_name", None)
            or getattr(sale.salesperson, "name", None)
            or getattr(sale.salesperson, "email", None)
        )

    return SaleResponse(
        id=sale.id,
        invoice_number=sale.invoice_number,
        customer_id=sale.customer_id,
        customer_name=sale.customer_name,
        sale_date=sale.sale_date,
        sales_channel=sale.sales_channel,
        payment_method=sale.payment_method,
        status=sale.status,
        notes=sale.notes,
        salesperson_name=salesperson_name,
        subtotal=sale.subtotal or 0,
        discount=sale.discount or 0,
        tax=sale.tax or 0,
        total_amount=sale.total_amount or 0,
        item_count=len(items_out),
        items=items_out,
        created_at=sale.created_at
    )


 
 
def validate_items(db: Session, company_id: int, items):

    validated = []

    for line in items:

        product = db.query(Product).filter(
            Product.id == line.product_id,
            Product.company_id == company_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {line.product_id} Not Found"
            )

        if product.stock_quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"{product.name} is Out of Stock"
            )

        if line.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )

        subtotal_line = line.quantity * line.unit_price

        if line.discount > subtotal_line:
            raise HTTPException(
                status_code=400,
                detail=f"Discount exceeds amount for {product.name}"
            )

        total_line = subtotal_line - line.discount + line.tax

        validated.append({
            "product": product,
            "line": line,
            "subtotal": subtotal_line,
            "total": total_line
        })

    return validated


# -----------------------------------------------------
# Create Sale
# -----------------------------------------------------
@router.post("/", response_model=SaleResponse)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    customer = db.query(Customer).filter(
        Customer.id == data.customer_id,
        Customer.company_id == current_user.company_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer Not Found"
        )

    validated_items = validate_items(
        db,
        current_user.company_id,
        data.items
    )

    invoice = generate_invoice(db, current_user.company_id)

    subtotal = sum(v["subtotal"] for v in validated_items)
    discount_total = sum(v["line"].discount for v in validated_items)
    tax_total = sum(v["line"].tax for v in validated_items)
    grand_total = sum(v["total"] for v in validated_items)

    sale = Sale(
        company_id=current_user.company_id,
        invoice_number=invoice,
        customer_id=customer.id,
        customer_name=customer.full_name,
        sale_date=datetime.utcnow(),
        sales_channel=data.sales_channel,
        payment_method=data.payment_method,
        status=data.status or "Paid",
        notes=data.notes,
        subtotal=subtotal,
        discount=discount_total,
        tax=tax_total,
        total_amount=grand_total,
        created_by=current_user.id
    )

    db.add(sale)
    db.commit()
    db.refresh(sale)

    for v in validated_items:

        product = v["product"]
        line = v["line"]

        db.add(
            SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                category_id=product.category_id,
                quantity=line.quantity,
                unit_price=line.unit_price,
                discount=line.discount,
                tax=line.tax,
                total=v["total"]
            )
        )

        previous_stock = product.stock_quantity
        product.stock_quantity -= line.quantity
 
        db.add(
            InventoryMovement(
                movement_type="OUT",
                quantity_changed=line.quantity,
                previous_quantity=previous_stock,
                updated_quantity=product.stock_quantity,
                reason="Sale Created",
                remarks=f"Invoice {invoice} - {product.name}",
                performed_by=current_user.id
            )
        )

        if product.stock_quantity <= 0:

            product.stock_quantity = 0
            product.status = "Out of Stock"

            db.add(
                Notification(
                    company_id=current_user.company_id,
                    title="Out of Stock",
                    message=f"{product.name} is Out of Stock",
                    type="danger"
                )
            )

            db.add(
                AuditLog(
                    company_id=current_user.company_id,
                    user_id=current_user.id,
                    invoice_number=invoice,
                    product_name=product.name,
                    action="Product Marked Out of Stock"
                )
            )

        elif product.stock_quantity <= 5:

            db.add(
                Notification(
                    company_id=current_user.company_id,
                    title="Low Stock Alert",
                    message=f"{product.name} has only {product.stock_quantity} items remaining",
                    type="warning"
                )
            )

        db.add(
            AuditLog(
                company_id=current_user.company_id,
                user_id=current_user.id,
                invoice_number=invoice,
                product_name=product.name,
                action="Sale Created"
            )
        )

    db.commit()
    db.refresh(sale)

    return build_sale_response(db, sale)


# -----------------------------------------------------
# Get All Sales (search, filter, sort)
# -----------------------------------------------------
@router.get("/", response_model=list[SaleResponse])
def get_sales(
    search: str = "",
    category: int | None = None,
    sales_channel: str = "",
    payment_method: str = "",
    payment_status: str = "",
    from_date: str | None = None,
    to_date: str | None = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    query = db.query(Sale).filter(
        Sale.company_id == current_user.company_id
    )

    if search:
        query = query.filter(
            (Sale.invoice_number.ilike(f"%{search}%")) |
            (Sale.customer_name.ilike(f"%{search}%"))
        )

    if category:
        query = (
            query.join(SaleItem, SaleItem.sale_id == Sale.id)
            .filter(SaleItem.category_id == category)
            .distinct()
        )

    if sales_channel:
        query = query.filter(Sale.sales_channel == sales_channel)

    if payment_method:
        query = query.filter(Sale.payment_method == payment_method)

    if payment_status:
        query = query.filter(Sale.status == payment_status)

    if from_date:
        query = query.filter(Sale.sale_date >= from_date)

    if to_date:
        query = query.filter(Sale.sale_date <= to_date)

    sort_map = {
        "date": Sale.sale_date,
        "total_amount": Sale.total_amount,
        "customer_name": Sale.customer_name
    }

    sort_column = sort_map.get(sort_by, Sale.sale_date)

    query = query.order_by(
        sort_column.asc() if sort_order == "asc" else sort_column.desc()
    )

    sales = query.all()

    return [build_sale_response(db, sale) for sale in sales]


# -----------------------------------------------------
# Get Single Sale
# -----------------------------------------------------
@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sale = db.query(Sale).filter(
        Sale.id == sale_id,
        Sale.company_id == current_user.company_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale Not Found"
        )

    return build_sale_response(db, sale)


# -----------------------------------------------------
# Update Sale
# -----------------------------------------------------
@router.put("/{sale_id}", response_model=SaleResponse)
def update_sale(
    sale_id: int,
    data: SaleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sale = db.query(Sale).filter(
        Sale.id == sale_id,
        Sale.company_id == current_user.company_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale Not Found"
        )

    if data.customer_id is not None:

        customer = db.query(Customer).filter(
            Customer.id == data.customer_id,
            Customer.company_id == current_user.company_id
        ).first()

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer Not Found"
            )

        sale.customer_id = customer.id
        sale.customer_name = customer.full_name

    if data.payment_method is not None:
        sale.payment_method = data.payment_method

    if data.sales_channel is not None:
        sale.sales_channel = data.sales_channel

    if data.notes is not None:
        sale.notes = data.notes

    if data.status is not None:
        sale.status = data.status

    if data.items is not None:

        # Restore stock from the old line items, then remove them.
        old_items = db.query(SaleItem).filter(
            SaleItem.sale_id == sale.id
        ).all()

        for old in old_items:

            product = db.query(Product).filter(
                Product.id == old.product_id
            ).first()

            if product:
                product.stock_quantity += old.quantity

            db.delete(old)

        db.flush()

        validated_items = validate_items(
            db,
            current_user.company_id,
            data.items
        )

        sale.subtotal = sum(v["subtotal"] for v in validated_items)
        sale.discount = sum(v["line"].discount for v in validated_items)
        sale.tax = sum(v["line"].tax for v in validated_items)
        sale.total_amount = sum(v["total"] for v in validated_items)

        for v in validated_items:

            product = v["product"]
            line = v["line"]

            db.add(
                SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    category_id=product.category_id,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    discount=line.discount,
                    tax=line.tax,
                    total=v["total"]
                )
            )

            previous_stock = product.stock_quantity
            product.stock_quantity -= line.quantity

            db.add(
                InventoryMovement(
                    movement_type="OUT",
                    quantity_changed=line.quantity,
                    previous_quantity=previous_stock,
                    updated_quantity=product.stock_quantity,
                    reason="Sale Updated",
                    remarks=f"Invoice {sale.invoice_number} - {product.name}",
                    performed_by=current_user.id
                )
            )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            invoice_number=sale.invoice_number,
            product_name="",
            action="Sale Updated"
        )
    )

    db.commit()
    db.refresh(sale)

    return build_sale_response(db, sale)


# -----------------------------------------------------
# Delete Sale
# -----------------------------------------------------
@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sale = db.query(Sale).filter(
        Sale.id == sale_id,
        Sale.company_id == current_user.company_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale Not Found"
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    for item in items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if product:

            previous_stock = product.stock_quantity
            product.stock_quantity += item.quantity

            db.add(
                InventoryMovement(
                    movement_type="IN",
                    quantity_changed=item.quantity,
                    previous_quantity=previous_stock,
                    updated_quantity=product.stock_quantity,
                    reason="Sale Deleted",
                    remarks=f"Invoice {sale.invoice_number} - {product.name}",
                    performed_by=current_user.id
                )
            )

        db.delete(item)

    invoice = sale.invoice_number

    db.delete(sale)

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            invoice_number=invoice,
            product_name="",
            action="Sale Deleted"
        )
    )

    db.commit()

    return {
        "message": "Sale Deleted Successfully"
    }


# -----------------------------------------------------
# Dashboard Summary
# -----------------------------------------------------
@router.get("/dashboard/summary")
def sales_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sales = db.query(Sale).filter(
        Sale.company_id == current_user.company_id
    ).all()

    revenue = sum(s.total_amount or 0 for s in sales)

    orders = len(sales)

    average = revenue / orders if orders else 0

    return {
        "total_sales": orders,
        "total_revenue": revenue,
        "total_orders": orders,
        "average_order_value": average
    }


# -----------------------------------------------------
# Invoice Export (PDF / CSV)
# -----------------------------------------------------
@router.get("/{sale_id}/export")
def export_invoice(
    sale_id: int,
    format: str = Query("pdf"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sale = db.query(Sale).filter(
        Sale.id == sale_id,
        Sale.company_id == current_user.company_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale Not Found"
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    rows = []

    for item in items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        rows.append({
            "name": product.name if product else "",
            "sku": getattr(product, "sku", "") if product else "",
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total": item.total
        })

    if format == "csv":

        output = StringIO()
        writer = csv.writer(output)

        writer.writerow(["Invoice Number", sale.invoice_number])
        writer.writerow(["Customer", sale.customer_name])
        writer.writerow(["Date", str(sale.sale_date)])
        writer.writerow(["Payment Method", sale.payment_method])
        writer.writerow(["Status", sale.status])
        writer.writerow([])

        writer.writerow(["Product", "SKU", "Quantity", "Unit Price", "Line Total"])

        for r in rows:
            writer.writerow([
                r["name"], r["sku"], r["quantity"], r["unit_price"], r["total"]
            ])

        writer.writerow([])
        writer.writerow(["Subtotal", sale.subtotal])
        writer.writerow(["Discount", sale.discount])
        writer.writerow(["Tax", sale.tax])
        writer.writerow(["Grand Total", sale.total_amount])

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition":
                f"attachment; filename=invoice_{sale.invoice_number}.csv"
            }
        )

    # ---- PDF ----
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Invoice: {sale.invoice_number}", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Customer: {sale.customer_name or '-'}", styles["Normal"]))
    elements.append(Paragraph(f"Date: {sale.sale_date}", styles["Normal"]))
    elements.append(Paragraph(f"Payment Method: {sale.payment_method or '-'}", styles["Normal"]))
    elements.append(Paragraph(f"Status: {sale.status or '-'}", styles["Normal"]))
    elements.append(Spacer(1, 16))

    table_data = [["Product", "SKU", "Qty", "Unit Price", "Line Total"]]

    for r in rows:
        table_data.append([
            r["name"], r["sku"], r["quantity"], r["unit_price"], r["total"]
        ])

    table = Table(table_data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10)
    ]))

    elements.append(table)
    elements.append(Spacer(1, 16))

    totals_data = [
        ["Subtotal", f"{sale.subtotal}"],
        ["Discount", f"{sale.discount}"],
        ["Tax", f"{sale.tax}"],
        ["Grand Total", f"{sale.total_amount}"]
    ]

    totals_table = Table(totals_data, colWidths=[150, 100])

    totals_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ]))

    elements.append(totals_table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f"attachment; filename=invoice_{sale.invoice_number}.pdf"
        }
    )