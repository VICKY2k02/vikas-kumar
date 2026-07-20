from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.notification import Notification

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# --------------------------------
# Get Notifications
# --------------------------------
@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.company_id == current_user.company_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return notifications


# --------------------------------
# Notification Count
# --------------------------------
@router.get("/count")
def notification_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    count = (
        db.query(Notification)
        .filter(
            Notification.company_id == current_user.company_id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "count": count
    }


# --------------------------------
# Mark as Read
# --------------------------------
@router.put("/{notification_id}")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.company_id == current_user.company_id
        )
        .first()
    )

    if notification:

        notification.is_read = True

        db.commit()

    return {
        "message": "Notification Updated"
    }


# --------------------------------
# Mark All Read
# --------------------------------
@router.put("/read/all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    (
        db.query(Notification)
        .filter(
            Notification.company_id == current_user.company_id
        )
        .update(
            {
                Notification.is_read: True
            }
        )
    )

    db.commit()

    return {
        "message": "All Notifications Read"
    }


# --------------------------------
# Delete Notification
# --------------------------------
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.company_id == current_user.company_id
        )
        .first()
    )

    if notification:

        db.delete(notification)

        db.commit()

    return {
        "message": "Notification Deleted"
    }


# --------------------------------
# Clear All Notifications
# --------------------------------
@router.delete("/clear/all")
def clear_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    (
        db.query(Notification)
        .filter(
            Notification.company_id == current_user.company_id
        )
        .delete()
    )

    db.commit()

    return {
        "message": "All Notifications Cleared"
    }