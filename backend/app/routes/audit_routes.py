from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.audit_log import AuditLog
from app.core.dependencies import require_roles


router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"]
)


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.company_id == current_user.company_id
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )

    return [

        {

            "id": log.id,

            "company": log.company.name if log.company else "",

            "user": log.user.name if log.user else "",

            "action": log.action,

            "ip_address": log.ip_address,

            "browser": log.browser,

            "timestamp": log.created_at.strftime(
                "%d-%m-%Y %I:%M %p"
            )

        }

        

        for log in logs

    ]



@router.delete("/clear")
def clear_audit_logs(

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Company Admin",
            "Super Admin"
        )
    )

):

    if current_user.role not in [
        "Company Admin",
        "Super Admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission Denied"
        )

    db.query(AuditLog).filter(
        AuditLog.company_id == current_user.company_id
    ).delete()

    db.commit()

    return {
        "message": "Audit logs cleared successfully"
    }