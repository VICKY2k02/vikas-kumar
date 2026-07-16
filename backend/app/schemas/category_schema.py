from pydantic import BaseModel
from typing import Optional


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: str = "Active"


class CategoryUpdate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: str


class CategoryResponse(BaseModel):
    id: int
    company_id: int
    name: str
    description: Optional[str]
    status: str
    product_count: int = 0

    class Config:
        from_attributes = True