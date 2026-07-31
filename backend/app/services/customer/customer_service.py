from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy import func, extract
from datetime import datetime
from sqlalchemy.orm import joinedload

from app.models.customer.customer import Customer
from app.models.customer.customer_purchase_summary import CustomerPurchaseSummary
from app.models.audit_log import AuditLog
from app.models.notification import Notification


from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.category import Category

from app.schemas.customer_schema import (
    CustomerCreate,
    CustomerUpdate
)


# -----------------------------------------
# Generate Customer ID
# -----------------------------------------
def generate_customer_id(db: Session):

    count = db.query(Customer).count() + 1

    return f"CUS{count:05d}"


# -----------------------------------------
# Create Customer
# -----------------------------------------
def create_customer(
    db: Session,
    customer: CustomerCreate,
    current_user
):

    existing = (
        db.query(Customer)
        .filter(
            Customer.company_id == current_user.company_id,
            or_(
                Customer.email == customer.email,
                Customer.phone == customer.phone
            )
        )
        .first()
    )

    if existing:
        raise Exception(
            "Customer already exists."
        )

    obj = Customer(

        company_id=current_user.company_id,

        customer_id=generate_customer_id(db),

        full_name=customer.full_name,

        email=customer.email,

        phone=customer.phone,

        gender=customer.gender,

        date_of_birth=customer.date_of_birth,

        address=customer.address,

        city=customer.city,

        state=customer.state,

        country=customer.country,

        customer_type=customer.customer_type,

        preferred_sales_channel=customer.preferred_sales_channel,

        status="Active"
    )

    db.add(obj)

    db.commit()

    db.refresh(obj)

    summary = CustomerPurchaseSummary(

        customer_id=obj.id

    )

    db.add(summary)

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            user_id=current_user.id,

            action="Customer Created"

        )

    )


    db.add(
        Notification(
            company_id=current_user.company_id,
            title="New Customer Registered",
            message=f"{obj.full_name} has been registered.",
            type="Customer"
        )
    )

    db.commit()

    return obj


# -----------------------------------------
# Get Customers
# -----------------------------------------
def get_customers(

    db: Session,

    current_user,

    search=None,

    customer_type=None,

    status=None,

    city=None,

    state=None,

    country=None

):

    query = (

        db.query(

            Customer,

            CustomerPurchaseSummary

        )

        .outerjoin(

            CustomerPurchaseSummary,

            Customer.id ==
            CustomerPurchaseSummary.customer_id

        )

        .filter(

            Customer.company_id ==
            current_user.company_id

        )

    )

    if search:

        query = query.filter(

            or_(

                Customer.full_name.ilike(f"%{search}%"),

                Customer.customer_id.ilike(f"%{search}%"),

                Customer.email.ilike(f"%{search}%"),

                Customer.phone.ilike(f"%{search}%")

            )

        )

    if customer_type:

        query = query.filter(

            Customer.customer_type ==
            customer_type

        )

    if status:

        query = query.filter(

            Customer.status == status

        )

    if city:

        query = query.filter(

            Customer.city == city

        )

    if state:

        query = query.filter(

            Customer.state == state

        )

    if country:

        query = query.filter(

            Customer.country == country

        )

    rows = query.order_by(

        Customer.id.desc()

    ).all()

    result = []

    for customer, summary in rows:

        data = customer.__dict__.copy()

        data.pop("_sa_instance_state", None)

        data["purchase_summary"] = {
            "total_orders": summary.total_orders if summary else 0,
            "total_revenue": summary.total_revenue if summary else 0,
            "total_products_purchased": (
                summary.total_products_purchased if summary else 0
            ),
            "average_order_value": summary.average_order_value if summary else 0,
            "purchase_frequency": summary.purchase_frequency if summary else 0,
            "first_purchase_date": (
                summary.first_purchase_date if summary else None
            ),
            "last_purchase_date": (
                summary.last_purchase_date if summary else None
            ),
        }

        result.append(data)

    return result


# -----------------------------------------
# Get Customer
# -----------------------------------------
def get_customer(
    db: Session,
    customer_id: int,
    current_user
):

    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.company_id == current_user.company_id
        )
        .first()
    )

    if not customer:
        return None

    summary = (
        db.query(CustomerPurchaseSummary)
        .filter(
            CustomerPurchaseSummary.customer_id == customer.id
        )
        .first()
    )

    orders = (
        db.query(Order)
        .filter(
            Order.customer_id == customer.id
        )
        .order_by(Order.created_at.desc())
        .all()
    )

    recent_transactions = []

    for order in orders:

        recent_transactions.append({

            "id": order.id,

            "date": order.created_at,

            "quantity": order.total_quantity,

            "amount": order.total_amount,

            "payment": order.payment_method

        })

    timeline = [

        {
            "title": "Customer Created",
            "date": customer.created_at
        }

    ]

    for order in orders:

        timeline.append({

            "title": "Order Created",

            "date": order.created_at

        })

    favorite_product = (

        db.query(

            Product.name,

            func.count(OrderItem.id)

        )

        .join(

            OrderItem,

            Product.id == OrderItem.product_id

        )

        .join(

            Order,

            Order.id == OrderItem.order_id

        )

        .filter(

            Order.customer_id == customer.id

        )

        .group_by(

            Product.name

        )

        .order_by(

            func.count(OrderItem.id).desc()

        )

        .first()

    )

    favorite_category = (

        db.query(

            Category.name,

            func.count(OrderItem.id)

        )

        .join(

            Product,

            Category.id == Product.category_id

        )

        .join(

            OrderItem,

            Product.id == OrderItem.product_id

        )

        .join(

            Order,

            Order.id == OrderItem.order_id

        )

        .filter(

            Order.customer_id == customer.id

        )

        .group_by(

            Category.name

        )

        .order_by(

            func.count(OrderItem.id).desc()

        )

        .first()

    )

    data = customer.__dict__.copy()

    data.pop("_sa_instance_state", None)

    if summary:

        data["total_orders"] = summary.total_orders

        data["total_revenue"] = summary.total_revenue

        data["total_products_purchased"] = summary.total_products_purchased

        data["average_order_value"] = summary.average_order_value

        data["purchase_frequency"] = summary.purchase_frequency

        data["first_purchase_date"] = summary.first_purchase_date

        data["last_purchase_date"] = summary.last_purchase_date

    else:

        data["total_orders"] = 0

        data["total_revenue"] = 0

        data["total_products_purchased"] = 0

        data["average_order_value"] = 0

        data["purchase_frequency"] = 0

        data["first_purchase_date"] = None

        data["last_purchase_date"] = None

    data["favorite_product"] = (

        favorite_product[0]

        if favorite_product

        else "-"

    )

    data["favorite_category"] = (

        favorite_category[0]

        if favorite_category

        else "-"

    )

    data["recent_transactions"] = recent_transactions

    data["timeline"] = timeline

    return data


# -----------------------------------------
# Update Customer
# -----------------------------------------
def update_customer(

    db: Session,

    customer_id: int,

    data: CustomerUpdate,

    current_user

):

    customer = get_customer(

        db,

        customer_id,

        current_user

    )

    if not customer:

        return None

    for key, value in data.model_dump(

        exclude_unset=True

    ).items():

        setattr(customer, key, value)

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            user_id=current_user.id,

            action="Customer Updated"

        )

    )

    if (
        data.customer_type
        and data.customer_type == "VIP"
    ):

        db.add(
            Notification(
                company_id=current_user.company_id,
                title="Customer Became VIP",
                message=f"{customer.full_name} reached VIP status.",
                type="Customer"
            )
        )

    db.commit()

    db.refresh(customer)

    return customer


# -----------------------------------------
# Delete Customer
# -----------------------------------------
def delete_customer(

    db: Session,

    customer_id: int,

    current_user

):

    customer = get_customer(

        db,

        customer_id,

        current_user

    )

    if not customer:

        return False

    db.delete(customer)

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            user_id=current_user.id,

            action="Customer Deleted"

        )

    )

    db.commit()

    return True


# -----------------------------------------
# Change Status
# -----------------------------------------
def change_status(

    db: Session,

    customer_id: int,

    status: str,

    current_user

):

    customer = get_customer(

        db,

        customer_id,

        current_user

    )

    if not customer:

        return None

    customer.status = status

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            user_id=current_user.id,

            action=f"Customer {status}"

        )

    )

    db.commit()

    db.refresh(customer)

    return customer



def get_customer_analytics(
    db: Session,
    current_user
):

    customers = (
        db.query(Customer)
        .filter(
            Customer.company_id ==
            current_user.company_id
        )
        .all()
    )

    total = len(customers)

    active = len([
        c for c in customers
        if c.status == "Active"
    ])

    inactive = total - active

    total_revenue = (
        db.query(
            func.sum(
                CustomerPurchaseSummary.total_revenue
            )
        )
        .join(
            Customer,
            Customer.id ==
            CustomerPurchaseSummary.customer_id
        )
        .filter(
            Customer.company_id ==
            current_user.company_id
        )
        .scalar()
        or 0
    )


    total_revenue = (
        db.query(
            func.sum(
                CustomerPurchaseSummary.total_revenue
            )
        )
        .join(
            Customer,
            Customer.id ==
            CustomerPurchaseSummary.customer_id
        )
        .filter(
            Customer.company_id ==
            current_user.company_id
        )
        .scalar()
        or 0
    )

    average_customer_spend = (
        total_revenue / total
        if total > 0
        else 0
    )


    average_purchase_frequency = (
        db.query(
            func.avg(
                CustomerPurchaseSummary.purchase_frequency
            )
        )
        .join(
            Customer,
            Customer.id ==
            CustomerPurchaseSummary.customer_id
        )
        .filter(
            Customer.company_id ==
            current_user.company_id
        )
        .scalar()
        or 0
    )


    new_customers = (
        db.query(Customer)
        .filter(
            Customer.company_id == current_user.company_id,
            extract(
                "month",
                Customer.created_at
            ) == datetime.utcnow().month,
            extract(
                "year",
                Customer.created_at
            ) == datetime.utcnow().year
        )
        .count()
    )


    returning_customers = (
        db.query(CustomerPurchaseSummary)
        .join(
            Customer,
            Customer.id ==
            CustomerPurchaseSummary.customer_id
        )
        .filter(
            Customer.company_id ==
            current_user.company_id,
            CustomerPurchaseSummary.total_orders > 1
        )
        .count()
    )


    revenue_by_type = (

        db.query(

            Customer.customer_type,

            func.sum(

                CustomerPurchaseSummary.total_revenue

            )

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

        .group_by(

            Customer.customer_type

        )

        .all()

    )


    top_customers = (

        db.query(

            Customer.full_name,

            CustomerPurchaseSummary.total_revenue

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

    location_distribution = (

        db.query(

            Customer.city,

            func.count(Customer.id)

        )

        .filter(

            Customer.company_id ==

            current_user.company_id

        )

        .group_by(

            Customer.city

        )

        .all()

    )

    spending_distribution = (

        db.query(

            Customer.full_name,

            CustomerPurchaseSummary.total_revenue

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

        .all()

    )


    customer_growth = (

        db.query(

            func.strftime(

                "%Y-%m",

                Customer.created_at

            ),

            func.count(Customer.id)

        )

        .filter(

            Customer.company_id ==

            current_user.company_id

        )

        .group_by(

            func.strftime(

                "%Y-%m",

                Customer.created_at

            )

        )

        .all()

    )

    return {

        "total_customers": total,

        "active_customers": active,

        "inactive_customers": inactive,

        "new_customers": new_customers,

        "returning_customers": returning_customers,
        
        "total_revenue": total_revenue,

        "average_customer_spend": average_customer_spend,

        "average_purchase_frequency": average_purchase_frequency,


        "customer_growth": [

            {

                "month": row[0],

                "customers": row[1]

            }

            for row in customer_growth

        ],

        "new_vs_returning": [],

        "revenue_by_type": [

            {

                "type": row[0],

                "revenue": row[1] or 0

            }

            for row in revenue_by_type

        ],


        "top_customers": [

            {

                "name": row[0],

                "revenue": row[1] or 0

            }

            for row in top_customers

        ],

        "location_distribution": [

            {

                "city": row[0] or "Unknown",

                "customers": row[1]

            }

            for row in location_distribution

        ],

        "spending_distribution": [

            {

                "name": row[0],

                "amount": row[1] or 0

            }

            for row in spending_distribution

        ],

    }