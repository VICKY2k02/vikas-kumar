from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.audit_log import AuditLog

from app.models.notification import Notification

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


# -----------------------------
# Generate Invoice Number
# -----------------------------
def generate_invoice(db, company_id):

    count = db.query(Sale).filter(
        Sale.company_id == company_id
    ).count()

    return f"INV-{datetime.now().year}-{str(count+1).zfill(6)}"


# -----------------------------
# Create Sale
# -----------------------------
@router.post("/")
def create_sale(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    invoice = generate_invoice(
        db,
        current_user.company_id
    )

    exists = db.query(Sale).filter(
        Sale.company_id == current_user.company_id,
        Sale.invoice_number == invoice
    ).first()

    if exists:
        raise HTTPException(
            400,
            "Duplicate Invoice"
        )

    product = db.query(Product).filter(
        Product.id == data["product_id"],
        Product.company_id == current_user.company_id
    ).first()

    if not product:
        raise HTTPException(
            404,
            "Product Not Found"
        )

    # if product.status == "Out of Stock":
    #     raise HTTPException(
    #         status_code=400,
    #         detail="Product is Out of Stock"
    #     )

    if product.stock_quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product is Out of Stock"
        )


    qty = data["quantity"]

    if qty <= 0:
        raise HTTPException(
            400,
            "Quantity should be greater than zero"
        )

    if qty > product.stock_quantity:
        raise HTTPException(
            400,
            "Insufficient Stock"
        )

    unit = data["unit_price"]

    discount = data.get(
        "discount",
        0
    )

    tax = data.get(
        "tax",
        0
    )

    subtotal = qty * unit

    if discount > subtotal:
        raise HTTPException(
            400,
            "Discount exceeds amount"
        )

    total = subtotal - discount + tax

    sale = Sale(
        company_id=current_user.company_id,
        invoice_number=invoice,
        customer_name=data["customer_name"],
        sale_date=datetime.utcnow(),
        sales_channel=data["sales_channel"],
        payment_method=data["payment_method"],
        total_amount=total,
        created_by=current_user.id
    )

    db.add(sale)
    db.commit()
    db.refresh(sale)

    item = SaleItem(
        sale_id=sale.id,
        product_id=product.id,
        category_id=product.category_id,
        quantity=qty,
        unit_price=unit,
        discount=discount,
        tax=tax,
        total=total
    )

    db.add(item)

    product.stock_quantity -= qty

    # Low Stock Notification
    if (
        product.stock_quantity > 0
        and product.stock_quantity <= 5
    ):
        db.add(
            Notification(
                company_id=current_user.company_id,
                title="Low Stock Alert",
                message=f"{product.name} has only {product.stock_quantity} items remaining",
                type="warning"
            )
        )

    # Out of Stock
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

        db.commit

        db.add(
            AuditLog(
                company_id=current_user.company_id,
                user_id=current_user.id,
                invoice_number=invoice,
                product_name=product.name,
                action="Product Marked Out of Stock"
            )
        )

    # Sale Created
    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            invoice_number=invoice,
            product_name=product.name,
            action="Sale Created"
        )
    )

    # Inventory Updated
    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            invoice_number=invoice,
            product_name=product.name,
            action="Inventory Updated"
        )
    )

    db.commit()

    return {
        "message": "Sale Created Successfully",
        "invoice": invoice,
        "remaining_stock": product.stock_quantity
    }


# -----------------------------
# Get All Sales
# -----------------------------
@router.get("/")
def get_sales(
    search: str = "",
    category: int | None = None,
    sales_channel: str = "",
    payment_method: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    print(
        search,
        category,
        sales_channel,
        payment_method
    )
    sales = db.query(Sale).filter(
        Sale.company_id == current_user.company_id
    )

    if search:
        sales = sales.filter(
            (Sale.invoice_number.ilike(f"%{search}%")) |
            (Sale.customer_name.ilike(f"%{search}%"))
        )

    if category:

        sales = sales.join(
            SaleItem,
            SaleItem.sale_id == Sale.id
        ).filter(
            SaleItem.category_id == category
        ).distinct()

    if sales_channel:

        sales = sales.filter(
            Sale.sales_channel == sales_channel
        )

    if payment_method:

        sales = sales.filter(
            Sale.payment_method == payment_method
        )

    sales = sales.order_by(
        Sale.sale_date.desc()
    ).all()

    result = []

    for sale in sales:

        item = db.query(SaleItem).filter(
            SaleItem.sale_id == sale.id
        ).first()

        product_name = ""
        quantity = 0

        if item:

            product = db.query(Product).filter(
                Product.id == item.product_id,
                Product.company_id == current_user.company_id
            ).first()

            if product:
                product_name = product.name

            quantity = item.quantity

        result.append({

            "id": sale.id,

            "invoice_number": sale.invoice_number,

            "customer_name": sale.customer_name,

            "product_name": product_name,

            "quantity": quantity,

            "sales_channel": sale.sales_channel,

            "payment_method": sale.payment_method,

            "total_amount": sale.total_amount,

            "sale_date": sale.sale_date

        })

    return result


# -----------------------------
# Get Single Sale
# -----------------------------
@router.get("/{sale_id}")
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
            404,
            "Sale Not Found"
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    result = []

    for item in items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        category = db.query(Category).filter(
            Category.id == item.category_id
        ).first()

        result.append({
            "product": product.name if product else "",
            "category": category.name if category else "",
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "discount": item.discount,
            "tax": item.tax,
            "total": item.total
        })

    return {
        "sale": sale,
        "items": result
    }



# -----------------------------
# Update Sale
# -----------------------------
@router.put("/{sale_id}")
def update_sale(
    sale_id: int,
    data: dict,
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

    item = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Sale Item Not Found"
        )

    old_product = db.query(Product).filter(
        Product.id == item.product_id
    ).first()

    if old_product:
        old_product.stock_quantity += item.quantity



    product = db.query(Product).filter(
        Product.id == data["product_id"],
        Product.company_id == current_user.company_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product Not Found"
        )

    qty = int(data["quantity"])

    if qty <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity should be greater than zero"
        )

    if qty > product.stock_quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient Stock"
        )

    unit_price = float(data["unit_price"])
    discount = float(data.get("discount", 0))
    tax = float(data.get("tax", 0))

    subtotal = qty * unit_price

    if discount > subtotal:
        raise HTTPException(
            status_code=400,
            detail="Discount exceeds total amount"
        )

    total = subtotal - discount + tax

    sale.customer_name = data["customer_name"]
    sale.sales_channel = data["sales_channel"]
    sale.payment_method = data["payment_method"]
    sale.total_amount = total
    sale.sale_date = datetime.utcnow()

    item.product_id = product.id
    item.category_id = product.category_id
    item.quantity = qty
    item.unit_price = unit_price
    item.discount = discount
    item.tax = tax
    item.total = total

    product.stock_quantity -= qty

    if product.stock_quantity <= 0:
        product.stock_quantity = 0
        product.status = "Out of Stock"

        db.add(
            AuditLog(
                company_id=current_user.company_id,
                user_id=current_user.id,
                # invoice_number=sale.invoice_number,
                invoice_number=invoice,
                product_name=product.name,
                action="Product Marked Out of Stock"
            )
        )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            # invoice_number=sale.invoice_number,
            invoice_number=invoice,
            product_name=product.name,
            action="Inventory Updated"
        )
    )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            # invoice_number=sale.invoice_number,
            invoice_number=invoice,
            product_name=product.name,
            action="Sale Updated"
        )
    )

    db.commit()

    return {
        "message": "Sale Updated Successfully"
    }



# -----------------------------
# Delete Sale
# -----------------------------
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
            404,
            "Sale Not Found"
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    for item in items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if product:
            product.stock_quantity += item.quantity

        db.delete(item)

    invoice = sale.invoice_number

    db.delete(sale)

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            invoice_number=invoice,
            product_name=product.name if product else "",
            action="Inventory Updated"
        )
    )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            invoice_number=invoice,
            product_name=product.name if product else "",
            action="Sale Deleted"
        )
    )

    db.commit()

    return {
        "message": "Sale Deleted Successfully"
    }


# -----------------------------
# Dashboard Summary
# -----------------------------
@router.get("/dashboard/summary")
def sales_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sales = db.query(Sale).filter(
        Sale.company_id == current_user.company_id
    ).all()

    revenue = sum(
        s.total_amount for s in sales
    )

    orders = len(sales)

    average = 0

    if orders:
        average = revenue / orders

    return {
        "total_sales": orders,
        "total_revenue": revenue,
        "total_orders": orders,
        "average_order_value": average
    }