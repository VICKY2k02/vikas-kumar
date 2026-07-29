from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.customer.customer_purchase_summary import CustomerPurchaseSummary
from app.models.sales.sale import Sale
from app.models.sales.sale_item import SaleItem


def update_customer_purchase_summary(
    db: Session,
    customer_id: int
):

    summary = (
        db.query(CustomerPurchaseSummary)
        .filter(
            CustomerPurchaseSummary.customer_id == customer_id
        )
        .first()
    )

    if not summary:

        summary = CustomerPurchaseSummary(
            customer_id=customer_id
        )

        db.add(summary)

    sales = (
        db.query(Sale)
        .filter(Sale.customer_id == customer_id)
        .all()
    )

    total_orders = len(sales)

    total_revenue = sum(
        sale.total_amount
        for sale in sales
    )

    total_products = (
        db.query(
            func.sum(
                SaleItem.quantity
            )
        )
        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )
        .filter(
            Sale.customer_id == customer_id
        )
        .scalar()
        or 0
    )

    average_order_value = 0

    if total_orders > 0:

        average_order_value = (
            total_revenue /
            total_orders
        )

    first_purchase = None
    last_purchase = None

    if sales:

        ordered = sorted(
            sales,
            key=lambda x: x.sale_date
        )

        first_purchase = ordered[0].sale_date
        last_purchase = ordered[-1].sale_date

    summary.total_orders = total_orders

    summary.total_revenue = total_revenue

    summary.total_products_purchased = total_products

    summary.average_order_value = average_order_value

    summary.first_purchase_date = first_purchase

    summary.last_purchase_date = last_purchase

    db.commit()

    db.refresh(summary)

    return summary