from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "Super Admin"
    COMPANY_ADMIN = "Company Admin"
    ANALYST = "Analyst"
    VIEWER = "Viewer"


class UserStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"