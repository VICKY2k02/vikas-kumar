from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.order import Order
from app.models.customer.customer import Customer
from app.models.customer.customer_purchase_summary import CustomerPurchaseSummary
from app.models.audit_log import AuditLog
from app.schemas.order_schema import OrderCreate, OrderUpdate
from app.models.notification import Notification

# -----------------------------------------
# Create Order
# -----------------------------------------
def create_order(
    db: Session,
    order: OrderCreate,
    current_user
):

    customer = (
        db.query(Customer)
        .filter(
            Customer.id == order.customer_id,
            Customer.company_id == current_user.company_id
        )
        .first()
    )

    if not customer:
        raise Exception("Customer not found")

    obj = Order(
        company_id=current_user.company_id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        total_quantity=order.total_quantity,
        payment_method=order.payment_method,
        status=order.status
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    update_customer_purchase_summary(
        db,
        customer.id
    )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action="Order Created"
        )
    )

    db.commit()

    return obj


# -----------------------------------------
# Get Orders
# -----------------------------------------

def get_orders(db: Session, current_user):

    orders = (
        db.query(Order)
        .options(joinedload(Order.customer))
        .filter(Order.company_id == current_user.company_id)
        .order_by(Order.id.desc())
        .all()
    )

    result = []

    for order in orders:

        result.append({

            "id": order.id,

            "customer_id": order.customer_id,

            "customer_name": order.customer.full_name if order.customer else "",

            "total_amount": order.total_amount,

            "total_quantity": order.total_quantity,

            "payment_method": order.payment_method,

            "status": order.status,

            "created_at": order.created_at

        })

    return result

# -----------------------------------------
# Get Single Order
# -----------------------------------------
def get_order(
    db: Session,
    order_id: int,
    current_user
):

    return (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.company_id == current_user.company_id
        )
        .first()
    )


# -----------------------------------------
# Update Order
# -----------------------------------------
def update_order(
    db: Session,
    order_id: int,
    data: OrderUpdate,
    current_user
):

    order = get_order(
        db,
        order_id,
        current_user
    )

    if not order:
        return None

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)

    update_customer_purchase_summary(
        db,
        order.customer_id
    )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action="Order Updated"
        )
    )

    db.commit()

    return order


# -----------------------------------------
# Delete Order
# -----------------------------------------
def delete_order(
    db: Session,
    order_id: int,
    current_user
):

    order = get_order(
        db,
        order_id,
        current_user
    )

    if not order:
        return False

    customer_id = order.customer_id

    db.delete(order)

    db.commit()

    update_customer_purchase_summary(
        db,
        customer_id
    )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action="Order Deleted"
        )
    )

    db.commit()

    return True


# -----------------------------------------
# Update Customer Purchase Summary
# -----------------------------------------
def update_customer_purchase_summary(
    db: Session,
    customer_id: int
):

    orders = (
        db.query(Order)
        .filter(
            Order.customer_id == customer_id,
            Order.status == "Completed"
        )
        .all()
    )

    total_orders = len(orders)

    total_revenue = sum(
        o.total_amount for o in orders
    )

    total_quantity = sum(
        o.total_quantity for o in orders
    )

    average_order = (
        total_revenue / total_orders
        if total_orders
        else 0
    )

    first_purchase = (
        min(o.created_at for o in orders)
        if orders
        else None
    )

    last_purchase = (
        max(o.created_at for o in orders)
        if orders
        else None
    )

    purchase_frequency = total_orders

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

    summary.total_orders = total_orders
    summary.total_revenue = total_revenue
    summary.total_products_purchased = total_quantity
    summary.average_order_value = average_order
    summary.purchase_frequency = purchase_frequency
    summary.first_purchase_date = first_purchase
    summary.last_purchase_date = last_purchase
    summary.updated_at = datetime.utcnow()

    if summary.total_orders == 1:

        customer = (
            db.query(Customer)
            .filter(
                Customer.id == summary.customer_id
            )
            .first()
        )

        if customer:

            db.add(
                Notification(
                    company_id=customer.company_id,
                    title="First Purchase",
                    message=f"{customer.full_name} completed the first purchase.",
                    type="Customer"
                )
            )

    db.commit()

