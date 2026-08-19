from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.inventory import Inventory
from app.models.inventory_movement import InventoryMovement
from app.models.product import Product
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.sale_item import SaleItem
from app.models.sale import Sale


# ============================================================
# STOCK HELPERS
# ============================================================

def calculate_available_stock(
    current_stock: int,
    reserved_stock: int
):
    available = current_stock - reserved_stock

    if available < 0:
        available = 0

    return available


def calculate_stock_status(
    available_stock: int,
    reorder_level: int
):
    if available_stock <= 0:
        return "Out of Stock"

    if available_stock <= reorder_level:
        return "Low Stock"

    return "In Stock"


# ============================================================
# CREATE INVENTORY
# ============================================================

def create_inventory(
    db: Session,
    data,
    current_user
):

    product = (
        db.query(Product)
        .filter(
            Product.id == data.product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    exists = (
        db.query(Inventory)
        .filter(
            Inventory.product_id == product.id,
            Inventory.company_id == current_user.company_id
        )
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=400,
            detail="Inventory already exists"
        )

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

    available_stock = calculate_available_stock(
        data.current_stock,
        data.reserved_stock
    )

    status = calculate_stock_status(
        available_stock,
        data.reorder_level
    )

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

    db.add(
        Notification(
            company_id=current_user.company_id,
            title="Inventory Created",
            message=f"{product.name} inventory created.",
            type="success"
        )
    )

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


# ============================================================
# ADD STOCK
# ============================================================

def add_stock(
    db: Session,
    inventory_id: int,
    quantity: int,
    reason: str,
    remarks: str,
    current_user
):

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.id == inventory_id,
            Inventory.company_id == current_user.company_id
        )
        .first()
    )

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

    product = (
        db.query(Product)
        .filter(
            Product.id == inventory.product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if product:
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


# ============================================================
# REMOVE STOCK
# ============================================================

def remove_stock(
    db: Session,
    inventory_id: int,
    quantity: int,
    reason: str,
    remarks: str,
    current_user
):

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.id == inventory_id,
            Inventory.company_id == current_user.company_id
        )
        .first()
    )

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

    product = (
        db.query(Product)
        .filter(
            Product.id == inventory.product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if product:
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


# ============================================================
# ADJUST STOCK
# ============================================================

def adjust_stock(
    db: Session,
    inventory_id: int,
    adjustment_type: str,
    quantity: int,
    reason: str,
    remarks: str,
    current_user
):

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.id == inventory_id,
            Inventory.company_id == current_user.company_id
        )
        .first()
    )

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

    if not reason or not reason.strip():
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

    db.add(
        InventoryMovement(
            inventory_id=inventory.id,
            movement_type=adjustment_type,
            quantity_changed=quantity,
            previous_quantity=previous_quantity,
            updated_quantity=inventory.current_stock,
            reason=reason,
            remarks=remarks,
            performed_by=current_user.id
        )
    )

    product = (
        db.query(Product)
        .filter(
            Product.id == inventory.product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if product:

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
                action=(
                    f"Stock Adjusted : {product.name} "
                    f"({adjustment_type} {quantity})"
                )
            )
        )

    db.commit()

    return {
        "message": "Stock Adjusted Successfully"
    }


# ============================================================
# UPDATE REORDER LEVEL
# ============================================================

def update_reorder_level(
    db: Session,
    inventory_id: int,
    reorder_level: int,
    current_user
):

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.id == inventory_id,
            Inventory.company_id == current_user.company_id
        )
        .first()
    )

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

    product = (
        db.query(Product)
        .filter(
            Product.id == inventory.product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if product:

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


# ============================================================
# GET INVENTORY BY ID
# ============================================================

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


# ============================================================
# GET ALL INVENTORY
# ============================================================

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

    if search:

        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%")
            )
        )

    if category is not None:

        query = query.filter(
            Product.category_id == category
        )

    if brand:

        query = query.filter(
            Product.brand.ilike(f"%{brand}%")
        )

    if stock_status:

        query = query.filter(
            Inventory.stock_status == stock_status
        )

    if sort_by == "product":

        query = query.order_by(
            Product.name.asc()
            if order == "asc"
            else Product.name.desc()
        )

    elif sort_by == "stock":

        query = query.order_by(
            Inventory.current_stock.asc()
            if order == "asc"
            else Inventory.current_stock.desc()
        )

    else:

        query = query.order_by(
            Inventory.updated_at.asc()
            if order == "asc"
            else Inventory.updated_at.desc()
        )

    records = query.all()

    result = []

    for inventory, product, category_obj in records:

        result.append({
            "id": inventory.id,
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "category": category_obj.name,
            "category_id": category_obj.id,
            "brand": product.brand,
            "current_stock": inventory.current_stock,
            "reserved_stock": inventory.reserved_stock,
            "available_stock": inventory.available_stock,
            "reorder_level": inventory.reorder_level,
            "stock_status": inventory.stock_status,
            "updated_at": inventory.updated_at
        })

    return result


# ============================================================
# INVENTORY DASHBOARD
# ============================================================

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
            func.coalesce(
                func.sum(Inventory.current_stock),
                0
            )
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


# ============================================================
# INVENTORY MOVEMENTS
# ============================================================

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


# ============================================================
# FORECAST CORE
# ============================================================

def _get_forecast_data(
    db: Session,
    current_user,
    forecast_days: int = 30,
    search: str = "",
    category: int | None = None,
    risk: str = "",
    reorder_required: bool | None = None,
    sort_by: str = "days_remaining"
):

    if forecast_days <= 0:
        raise HTTPException(
            status_code=400,
            detail="Forecast days must be greater than zero"
        )

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

    if search:

        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%")
            )
        )

    if category is not None:

        query = query.filter(
            Product.category_id == category
        )

    records = query.all()

    result = []

    for inventory, product, category_obj in records:

        # ----------------------------------------
        # Historical Sales
        # ----------------------------------------

        historical_sales = (
            db.query(
                func.coalesce(
                    func.sum(SaleItem.quantity),
                    0
                )
            )
            .join(
                Sale,
                Sale.id == SaleItem.sale_id
            )
            .filter(
                SaleItem.product_id == product.id,
                Sale.company_id == current_user.company_id
            )
            .scalar()
            or 0
        )

        historical_sales = int(historical_sales)

        # ----------------------------------------
        # Average Daily Sales
        # ----------------------------------------

        average_daily_sales = (
            float(historical_sales) / 30
            if historical_sales > 0
            else 0
        )

        # ----------------------------------------
        # Forecast Demand
        # ----------------------------------------

        forecasted_demand = (
            average_daily_sales * forecast_days
        )

        # ----------------------------------------
        # Lead Time
        # ----------------------------------------

        lead_time_days = 7

        # ----------------------------------------
        # Safety Stock
        # ----------------------------------------

        safety_stock = average_daily_sales * 3

        # ----------------------------------------
        # Reorder Point
        # ----------------------------------------

        reorder_point = (
            average_daily_sales * lead_time_days
        ) + safety_stock

        # ----------------------------------------
        # Days Remaining
        # ----------------------------------------

        if average_daily_sales > 0:

            days_remaining = (
                inventory.available_stock /
                average_daily_sales
            )

        else:

            days_remaining = None

        # ----------------------------------------
        # Stock Risk
        # ----------------------------------------

        current_stock = inventory.available_stock

        if current_stock <= 0:

            stock_risk = "Out of Stock"

        elif (
            average_daily_sales > 0
            and days_remaining <= lead_time_days
        ):

            stock_risk = "Stockout Risk"

        elif current_stock <= reorder_point:

            stock_risk = "Low Stock"

        elif current_stock > (
            forecasted_demand +
            safety_stock
        ) * 2:

            stock_risk = "Overstock"

        else:

            stock_risk = "Healthy"

        # ----------------------------------------
        # Recommended Quantity
        # ----------------------------------------

        target_stock = (
            forecasted_demand +
            reorder_point
        )

        recommended_quantity = max(
            0,
            round(
                target_stock - current_stock
            )
        )

        needs_reorder = (
            recommended_quantity > 0
        )

        # ----------------------------------------
        # Risk Filter
        # ----------------------------------------

        if risk and stock_risk != risk:
            continue

        # ----------------------------------------
        # Reorder Filter
        # ----------------------------------------

        if (
            reorder_required is not None
            and needs_reorder != reorder_required
        ):
            continue

        # ----------------------------------------
        # Recommendation
        # ----------------------------------------

        if stock_risk == "Out of Stock":

            recommendation = (
                "Immediate replenishment required."
            )

        elif stock_risk == "Stockout Risk":

            recommendation = (
                "Reorder soon to avoid stockout."
            )

        elif stock_risk == "Low Stock":

            recommendation = (
                "Inventory is below the recommended level."
            )

        elif stock_risk == "Overstock":

            recommendation = (
                "Excess inventory detected. "
                "Avoid additional replenishment."
            )

        elif historical_sales == 0:

            recommendation = (
                "No sales history available. "
                "Forecast demand is zero."
            )

        else:

            recommendation = (
                "Inventory level is healthy."
            )

        # ----------------------------------------
        # Final Item
        # ----------------------------------------

        result.append({

            "product_id": product.id,

            "product": product.name,

            "sku": product.sku,

            "category": category_obj.name,

            "category_id": category_obj.id,

            "current_stock": inventory.current_stock,

            "available_stock": inventory.available_stock,

            "historical_sales": historical_sales,

            "average_daily_sales": round(
                average_daily_sales,
                2
            ),

            "forecasted_demand": round(
                forecasted_demand,
                2
            ),

            "forecast_days": forecast_days,

            "lead_time_days": lead_time_days,

            "safety_stock": round(
                safety_stock,
                2
            ),

            "reorder_point": round(
                reorder_point,
                2
            ),

            "days_of_stock_remaining": (
                round(days_remaining, 2)
                if days_remaining is not None
                else None
            ),

            "recommended_reorder_quantity":
                recommended_quantity,

            "stock_risk": stock_risk,

            "reorder_required":
                needs_reorder,

            "recommendation":
                recommendation
        })

    # ========================================================
    # SORT
    # ========================================================

    if sort_by == "current_stock":

        result.sort(
            key=lambda x: x["current_stock"]
        )

    elif sort_by == "forecasted_demand":

        result.sort(
            key=lambda x: x["forecasted_demand"]
        )

    elif sort_by == "recommended_quantity":

        result.sort(
            key=lambda x:
                x["recommended_reorder_quantity"]
        )

    elif sort_by == "risk":

        result.sort(
            key=lambda x:
                x["stock_risk"]
        )

    elif sort_by == "product":

        result.sort(
            key=lambda x:
                x["product"].lower()
        )

    else:

        result.sort(
            key=lambda x:
                float("inf")
                if x["days_of_stock_remaining"] is None
                else x["days_of_stock_remaining"]
        )

    return result


# ============================================================
# FORECAST
# ============================================================

def calculate_inventory_forecast(
    db: Session,
    current_user,
    forecast_days: int = 30,
    search: str = "",
    category: int | None = None,
    risk: str = "",
    reorder_required: bool | None = None,
    sort_by: str = "days_remaining"
):

    items = _get_forecast_data(
        db=db,
        current_user=current_user,
        forecast_days=forecast_days,
        search=search,
        category=category,
        risk=risk,
        reorder_required=reorder_required,
        sort_by=sort_by
    )

    return {
        "items": items,
        "total": len(items)
    }


# ============================================================
# RECOMMENDATIONS
# ============================================================

def get_inventory_recommendations(
    db: Session,
    current_user,
    forecast_days: int = 30
):

    items = _get_forecast_data(
        db=db,
        current_user=current_user,
        forecast_days=forecast_days
    )

    recommendations = [
        item
        for item in items
        if item["reorder_required"]
    ]

    return {
        "items": recommendations,
        "total": len(recommendations)
    }


# ============================================================
# SINGLE PRODUCT RECOMMENDATION
# ============================================================

def get_inventory_recommendation(
    db: Session,
    current_user,
    product_id: int,
    forecast_days: int = 30
):

    items = _get_forecast_data(
        db=db,
        current_user=current_user,
        forecast_days=forecast_days
    )

    item = next(
        (
            x
            for x in items
            if x["product_id"] == product_id
        ),
        None
    )

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Product inventory forecast not found"
        )

    return item


# ============================================================
# FORECAST SUMMARY
# ============================================================

def inventory_forecast_summary(
    db: Session,
    current_user,
    forecast_days: int = 30
):

    items = _get_forecast_data(
        db=db,
        current_user=current_user,
        forecast_days=forecast_days
    )

    return {

        "total_products":
            len(items),

        "products_requiring_reorder":
            sum(
                1
                for x in items
                if x["reorder_required"]
            ),

        "stockout_risk":
            sum(
                1
                for x in items
                if x["stock_risk"] == "Stockout Risk"
            ),

        "out_of_stock":
            sum(
                1
                for x in items
                if x["stock_risk"] == "Out of Stock"
            ),

        "low_stock":
            sum(
                1
                for x in items
                if x["stock_risk"] == "Low Stock"
            ),

        "overstocked":
            sum(
                1
                for x in items
                if x["stock_risk"] == "Overstock"
            ),

        "healthy":
            sum(
                1
                for x in items
                if x["stock_risk"] == "Healthy"
            ),

        "no_sales_history":
            sum(
                1
                for x in items
                if x["historical_sales"] == 0
            ),

        "total_forecasted_demand":
            round(
                sum(
                    x["forecasted_demand"]
                    for x in items
                ),
                2
            ),

        "total_recommended_quantity":
            sum(
                x["recommended_reorder_quantity"]
                for x in items
            )
    }


# ============================================================
# FORECAST CHART
# ============================================================

def get_forecast_chart(
    db: Session,
    current_user,
    forecast_days: int = 30
):

    items = _get_forecast_data(
        db=db,
        current_user=current_user,
        forecast_days=forecast_days
    )

    return [
        {
            "product_id": item["product_id"],
            "product": item["product"],
            "sku": item["sku"],
            "current_stock": item["current_stock"],
            "forecasted_demand": item["forecasted_demand"],
            "recommended_reorder_quantity":
                item["recommended_reorder_quantity"],
            "days_of_stock_remaining":
                item["days_of_stock_remaining"],
            "stock_risk": item["stock_risk"]
        }
        for item in items
    ]


