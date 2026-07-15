from fastapi import HTTPException, Depends

from app.core.dependencies import get_current_user


class RoleChecker:

    def __init__(self, allowed_roles):

        self.allowed_roles = allowed_roles

    def __call__(self, user=Depends(get_current_user)):

        if user.role not in self.allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="Permission Denied"
            )

        return user