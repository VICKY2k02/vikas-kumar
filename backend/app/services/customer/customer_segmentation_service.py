from sqlalchemy.orm import Session

from app.models.customer.customer import Customer


def get_customer_segments(db: Session, current_user):

    customers = (
        db.query(Customer)
        .filter(Customer.company_id == current_user.company_id)
        .all()
    )

    result = []

    for customer in customers:

        summary = customer.purchase_summary

        revenue = (
            summary.total_revenue
            if summary else 0
        )

        orders = (
            summary.total_orders
            if summary else 0
        )

        if revenue >= 100000 or orders >= 50:
            segment = "VIP Customer"

        elif revenue >= 50000 or orders >= 20:
            segment = "Loyal Customer"

        elif orders >= 5:
            segment = "Regular Customer"

        else:
            segment = "New Customer"

        result.append({

            "customer_id": customer.customer_id,

            "name": customer.full_name,

            "segment": segment,

            "revenue": revenue,

            "orders": orders

        })

    return result