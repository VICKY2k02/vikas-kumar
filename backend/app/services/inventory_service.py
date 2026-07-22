from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from datetime import datetime
from sqlalchemy import or_

from app.models.category import Category
from app.models.inventory import Inventory
from app.models.inventory_movement import InventoryMovement
from app.models.product import Product
from app.models.notification import Notification
from app.models.audit_log import AuditLog


def calculate_stock_status(
    available_stock: int,
    reorder_level: int
):

    if available_stock <= 0:
        return "Out of Stock"

    if available_stock <= reorder_level:
        return "Low Stock"

    return "In Stock"


def calculate_available_stock(
    current_stock: int,
    reserved_stock: int
):

    available = current_stock - reserved_stock

    if available < 0:
        available = 0

    return available


def create_inventory(
    db: Session,
    data,
    current_user
):

    # -----------------------------
    # Check Product
    # -----------------------------
    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.company_id == current_user.company_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # -----------------------------
    # Check Existing Inventory
    # -----------------------------
    exists = db.query(Inventory).filter(
        Inventory.product_id == product.id,
        Inventory.company_id == current_user.company_id
    ).first()

    if exists:
        raise HTTPException(
            status_code=400,
            detail="Inventory already exists"
        )

    # -----------------------------
    # Validations
    # -----------------------------
    if data.current_stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Current stock cannot be negative"
        )

    if data.reserved_stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Reserved stock cannot be negative"
        )

    if data.reorder_level < 0:
        raise HTTPException(
            status_code=400,
            detail="Reorder level cannot be negative"
        )

    # -----------------------------
    # Calculate Stock
    # -----------------------------
    available_stock = calculate_available_stock(
        data.current_stock,
        data.reserved_stock
    )

    status = calculate_stock_status(
        available_stock,
        data.reorder_level
    )

    # -----------------------------
    # Create Inventory
    # -----------------------------
    inventory = Inventory(
        company_id=current_user.company_id,
        product_id=product.id,
        current_stock=data.current_stock,
        reserved_stock=data.reserved_stock,
        available_stock=available_stock,
        reorder_level=data.reorder_level,
        stock_status=status
    )

    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    # -----------------------------
    # Inventory Movement
    # -----------------------------
    movement = InventoryMovement(
        inventory_id=inventory.id,
        movement_type="Stock Addition",
        quantity_changed=data.current_stock,
        previous_quantity=0,
        updated_quantity=data.current_stock,
        reason="Initial Inventory",
        remarks="Inventory Created",
        performed_by=current_user.id
    )

    db.add(movement)

    # -----------------------------
    # Notification
    # -----------------------------
    db.add(
        Notification(
            company_id=current_user.company_id,
            title="Inventory Created",
            message=f"{product.name} inventory created.",
            type="success"
        )
    )

    # -----------------------------
    # Audit Log
    # -----------------------------
    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action=f"Inventory Created : {product.name}"
        )
    )

    db.commit()

    return {
        "message": "Inventory Created Successfully",
        "inventory_id": inventory.id
    }


def add_stock(
    db: Session,
    inventory_id: int,
    quantity: int,
    reason: str,
    remarks: str,
    current_user
):

    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.company_id == current_user.company_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    previous_quantity = inventory.current_stock

    inventory.current_stock += quantity

    inventory.available_stock = calculate_available_stock(
        inventory.current_stock,
        inventory.reserved_stock
    )

    inventory.stock_status = calculate_stock_status(
        inventory.available_stock,
        inventory.reorder_level
    )

    inventory.updated_at = datetime.utcnow()

    db.add(
        InventoryMovement(
            inventory_id=inventory.id,
            movement_type="Stock Addition",
            quantity_changed=quantity,
            previous_quantity=previous_quantity,
            updated_quantity=inventory.current_stock,
            reason=reason,
            remarks=remarks,
            performed_by=current_user.id
        )
    )

    product = db.query(Product).filter(
        Product.id == inventory.product_id
    ).first()

    product.stock_quantity = inventory.current_stock

    db.add(
        Notification(
            company_id=current_user.company_id,
            title="Stock Added",
            message=f"{quantity} units added to {product.name}",
            type="success"
        )
    )

    db.add(
        AuditLog(
            company_id=current_user.company_id,
            user_id=current_user.id,
            action=f"Stock Added : {product.name} (+{quantity})"
        )
    )

    db.commit()

    return {
        "message": "Stock Added Successfully"
    }


def remove_stock(
    db: Session,
    inventory_id: int,
    quantity: int,
    reason: str,
    remarks: str,
    current_user
):

    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.company_id == current_user.company_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if quantity > inventory.available_stock:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    previous_quantity = inventory.current_stock

    inventory.current_stock -= quantity

    inventory.available_stock = calculate_available_stock(
        inventory.current_stock,
        inventory.reserved_stock
    )

    inventory.stock_status = calculate_stock_status(
        inventory.available_stock,
        inventory.reorder_level
    )

    inventory.updated_at = datetime.utcnow()

    db.add(
        InventoryMovement(
            inventory_id=inventory.id,
            movement_type="Stock Removal",
            quantity_changed=quantity,
            previous_quantity=previous_quantity,
            updated_quantity=inventory.current_stock,
            reason=reason,
            remarks=remarks,
            performed_by=current_user.id
        )
    )

    product = db.query(Product).filter(
        Product.id == inventory.product_id
    ).first()

    product.stock_quantity = inventory.current_stock

    if inventory.stock_status == "Low Stock":

        db.add(
            Notification(
                company_id=current_user.company_id,
                title="Low Stock Alert",
                message=f"{product.name} reached Low Stock",
                type="warning"
            )
        )

    if inventory.stock_status == "Out of Stock":

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
            action=f"Stock Removed : {product.name} (-{quantity})"
        )
    )

    db.commit()

    return {
        "message": "Stock Removed Successfully"
    }


def adjust_stock(
    db: Session,
    inventory_id: int,
    adjustment_type: str,
    quantity: int,
    reason: str,
    remarks: str,
    current_user
):

    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.company_id == current_user.company_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if not reason.strip():
        raise HTTPException(
            status_code=400,
            detail="Reason is required"
        )

    previous_quantity = inventory.current_stock

    if adjustment_type == "Stock Addition":

        inventory.current_stock += quantity

    elif adjustment_type == "Stock Removal":

        if quantity > inventory.available_stock:

            raise HTTPException(
                status_code=400,
                detail="Insufficient Stock"
            )

        inventory.current_stock -= quantity

    elif adjustment_type == "Manual Adjustment":

        inventory.current_stock = quantity

    else:

        raise HTTPException(
            status_code=400,
            detail="Invalid adjustment type"
        )

    inventory.available_stock = calculate_available_stock(
        inventory.current_stock,
        inventory.reserved_stock
    )

    inventory.stock_status = calculate_stock_status(
        inventory.available_stock,
        inventory.reorder_level
    )

    inventory.updated_at = datetime.utcnow()

    movement = InventoryMovement(

        inventory_id=inventory.id,

        movement_type=adjustment_type,

        quantity_changed=quantity,

        previous_quantity=previous_quantity,

        updated_quantity=inventory.current_stock,

        reason=reason,

        remarks=remarks,

        performed_by=current_user.id

    )

    db.add(movement)

    product = db.query(Product).filter(
        Product.id == inventory.product_id
    ).first()

    product.stock_quantity = inventory.current_stock

    db.add(

        Notification(

            company_id=current_user.company_id,

            title="Inventory Adjusted",

            message=f"{product.name} stock adjusted by {quantity}",

            type="info"

        )

    )

    if inventory.stock_status == "Low Stock":

        db.add(

            Notification(

                company_id=current_user.company_id,

                title="Low Stock Alert",

                message=f"{product.name} reached Low Stock",

                type="warning"

            )

        )

    if inventory.stock_status == "Out of Stock":

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

            action=f"Stock Adjusted : {product.name} ({adjustment_type} {quantity})"

        )

    )

    db.commit()

    return {

        "message": "Stock Adjusted Successfully"

    }





def update_reorder_level(

    db: Session,

    inventory_id: int,

    reorder_level: int,

    current_user

):

    inventory = db.query(Inventory).filter(

        Inventory.id == inventory_id,

        Inventory.company_id == current_user.company_id

    ).first()

    if not inventory:

        raise HTTPException(

            status_code=404,

            detail="Inventory not found"

        )

    if reorder_level < 0:

        raise HTTPException(

            status_code=400,

            detail="Reorder level cannot be negative"

        )

    inventory.reorder_level = reorder_level

    inventory.stock_status = calculate_stock_status(

        inventory.available_stock,

        reorder_level

    )

    inventory.updated_at = datetime.utcnow()

    product = db.query(Product).filter(

        Product.id == inventory.product_id

    ).first()

    product.stock_quantity = inventory.current_stock

    db.add(

        AuditLog(

            company_id=current_user.company_id,

            user_id=current_user.id,

            action=f"Reorder Level Updated : {product.name}"

        )

    )

    db.commit()

    return {

        "message": "Reorder Level Updated Successfully"

    }


def get_inventory_by_id(

    db: Session,

    inventory_id: int,

    current_user

):

    record = (

        db.query(

            Inventory,

            Product,

            Category

        )

        .join(

            Product,

            Inventory.product_id == Product.id

        )

        .join(

            Category,

            Product.category_id == Category.id

        )

        .filter(

            Inventory.id == inventory_id,

            Inventory.company_id == current_user.company_id

        )

        .first()

    )

    if not record:

        raise HTTPException(

            status_code=404,

            detail="Inventory not found"

        )

    inventory, product, category = record

    return {

        "id": inventory.id,

        "product_id": product.id,

        "product_name": product.name,

        "sku": product.sku,

        "category": category.name,

        "brand": product.brand,

        "current_stock": inventory.current_stock,

        "reserved_stock": inventory.reserved_stock,

        "available_stock": inventory.available_stock,

        "reorder_level": inventory.reorder_level,

        "stock_status": inventory.stock_status,

        "updated_at": inventory.updated_at

    }


def get_all_inventory(
    db: Session,
    current_user,
    search: str = "",
    category: int | None = None,
    brand: str = "",
    stock_status: str = "",
    sort_by: str = "updated_at",
    order: str = "desc"
):

    query = (
        db.query(
            Inventory,
            Product,
            Category
        )
        .join(
            Product,
            Inventory.product_id == Product.id
        )
        .join(
            Category,
            Product.category_id == Category.id
        )
        .filter(
            Inventory.company_id == current_user.company_id
        )
    )

    # -------------------------
    # Search
    # -------------------------

    if search:

        query = query.filter(

            or_(

                Product.name.ilike(f"%{search}%"),

                Product.sku.ilike(f"%{search}%")

            )

        )

    # -------------------------
    # Category
    # -------------------------

    if category:

        query = query.filter(

            Product.category_id == category

        )

    # -------------------------
    # Brand
    # -------------------------

    if brand:

        query = query.filter(

            Product.brand.ilike(f"%{brand}%")

        )

    # -------------------------
    # Stock Status
    # -------------------------

    if stock_status:

        query = query.filter(

            Inventory.stock_status == stock_status

        )

    # -------------------------
    # Sorting
    # -------------------------

    if sort_by == "product":

        if order == "asc":

            query = query.order_by(Product.name.asc())

        else:

            query = query.order_by(Product.name.desc())

    elif sort_by == "stock":

        if order == "asc":

            query = query.order_by(
                Inventory.current_stock.asc()
            )

        else:

            query = query.order_by(
                Inventory.current_stock.desc()
            )

    else:

        if order == "asc":

            query = query.order_by(
                Inventory.updated_at.asc()
            )

        else:

            query = query.order_by(
                Inventory.updated_at.desc()
            )

    records = query.all()

    result = []

    for inventory, product, category in records:

        result.append({

            "id": inventory.id,

            "product_id": product.id,

            "product_name": product.name,

            "sku": product.sku,

            "category": category.name,

            "brand": product.brand,

            "current_stock": inventory.current_stock,

            "reserved_stock": inventory.reserved_stock,

            "available_stock": inventory.available_stock,

            "reorder_level": inventory.reorder_level,

            "stock_status": inventory.stock_status,

            "updated_at": inventory.updated_at

        })

    return result


def inventory_dashboard(
    db: Session,
    current_user
):

    total_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == current_user.company_id
        )
        .count()
    )

    total_inventory_quantity = (
        db.query(
            func.coalesce(func.sum(Inventory.current_stock), 0)
        )
        .filter(
            Inventory.company_id == current_user.company_id
        )
        .scalar()
    )

    low_stock_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == current_user.company_id,
            Inventory.stock_status == "Low Stock"
        )
        .count()
    )

    out_of_stock_products = (
        db.query(Inventory)
        .filter(
            Inventory.company_id == current_user.company_id,
            Inventory.stock_status == "Out of Stock"
        )
        .count()
    )

    category_chart = (
        db.query(
            Category.name,
            func.count(Inventory.id)
        )
        .join(
            Product,
            Product.category_id == Category.id
        )
        .join(
            Inventory,
            Inventory.product_id == Product.id
        )
        .filter(
            Inventory.company_id == current_user.company_id
        )
        .group_by(Category.name)
        .all()
    )

    status_chart = (
        db.query(
            Inventory.stock_status,
            func.count(Inventory.id)
        )
        .filter(
            Inventory.company_id == current_user.company_id
        )
        .group_by(
            Inventory.stock_status
        )
        .all()
    )

    return {

        "summary": {

            "total_products": total_products,

            "total_inventory_quantity": total_inventory_quantity,

            "low_stock_products": low_stock_products,

            "out_of_stock_products": out_of_stock_products

        },

        "inventory_by_category": [

            {

                "category": row[0],

                "count": row[1]

            }

            for row in category_chart

        ],

        "stock_status_distribution": [

            {

                "status": row[0],

                "count": row[1]

            }

            for row in status_chart

        ]

    }




def get_inventory_movements(
    db: Session,
    current_user,
    inventory_id: int
):

    records = (
        db.query(
            InventoryMovement,
            Inventory,
            Product
        )
        .join(
            Inventory,
            InventoryMovement.inventory_id == Inventory.id
        )
        .join(
            Product,
            Inventory.product_id == Product.id
        )
        .filter(
            Inventory.id == inventory_id,
            Inventory.company_id == current_user.company_id
        )
        .order_by(
            InventoryMovement.created_at.desc()
        )
        .all()
    )

    result = []

    for movement, inventory, product in records:

        result.append({
            "movement_id": movement.id,
            "inventory_id": inventory.id,
            "product_name": product.name,
            "sku": product.sku,
            "movement_type": movement.movement_type,
            "previous_quantity": movement.previous_quantity,
            "updated_quantity": movement.updated_quantity,
            "quantity_changed": movement.quantity_changed,
            "reason": movement.reason,
            "remarks": movement.remarks,
            "performed_by": movement.performed_by,
            "created_at": movement.created_at
        })

    return result

    # -------------------------
    # Filter by Movement Type
    # -------------------------

    if movement_type:

        query = query.filter(
            InventoryMovement.movement_type == movement_type
        )

    # -------------------------
    # Search by Product Name
    # -------------------------

    if product_name:

        query = query.filter(
            Product.name.ilike(f"%{product_name}%")
        )

    records = (
        query
        .order_by(
            InventoryMovement.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    result = []

    for movement, inventory, product in records:

        result.append({

            "movement_id": movement.id,

            "inventory_id": inventory.id,

            "product_name": product.name,

            "sku": product.sku,

            "movement_type": movement.movement_type,

            "previous_quantity": movement.previous_quantity,

            "updated_quantity": movement.updated_quantity,

            "quantity_changed": movement.quantity_changed,

            "reason": movement.reason,

            "remarks": movement.remarks,

            "performed_by": movement.performed_by,

            "created_at": movement.created_at

        })

    return result














