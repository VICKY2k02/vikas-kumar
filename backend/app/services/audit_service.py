from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.company import Company

def get_browser(user_agent: str):

    if not user_agent:
        return "Unknown"

    if "Edg/" in user_agent:
        return "Microsoft Edge"

    elif "Chrome/" in user_agent:
        return "Google Chrome"

    elif "Firefox/" in user_agent:
        return "Mozilla Firefox"

    elif "Safari/" in user_agent and "Chrome" not in user_agent:
        return "Safari"

    elif "OPR/" in user_agent:
        return "Opera"

    return "Unknown"

def create_audit_log(
    db,
    company_id,
    user_id,
    action,
    ip_address="Unknown",
    browser="Unknown"
):
    try:
        print("Creating Audit Log")
        print("Company ID:", company_id)
        print("User ID:", user_id)
        print("Action:", action)

        log = AuditLog(
            company_id=company_id,
            user_id=user_id,
            action=action,
            ip_address=ip_address,
            browser=browser
        )

        db.add(log)
        print("Added")

        db.commit()
        print("Committed")

        db.refresh(log)
        print("Audit Log ID:", log.id)

        return log

    except Exception as e:
        db.rollback()
        print("AUDIT ERROR:", e)
        raise