from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.customer.customer_purchase_summary import CustomerPurchaseSummary
from app.models.order import Order
from app.models.order_item import OrderItem


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




    orders = (
        db.query(Order)
        .filter(Order.customer_id == customer_id)
        .all()
    )


    total_orders = len(orders)

    total_revenue = sum(
        order.total_amount
        for order in orders
    )

    total_products = (
        db.query(
            func.sum(
                OrderItem.quantity
            )
        )

        .join(
            Order,
            Order.id == OrderItem.order_id
        )
        .filter(
            Order.customer_id == customer_id
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


    if orders:

 
        ordered = sorted(
            orders,
            key=lambda x: x.created_at
        )


        first_purchase = ordered[0].created_at
        last_purchase = ordered[-1].created_at


    summary.total_orders = total_orders

    summary.total_revenue = total_revenue

    summary.total_products_purchased = total_products

    summary.average_order_value = average_order_value

    summary.first_purchase_date = first_purchase

    summary.last_purchase_date = last_purchase



    db.add(summary) 

    db.commit()

    db.refresh(summary)

    return summary