from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error_code: str
    message: str
    details: Optional[Any] = None
