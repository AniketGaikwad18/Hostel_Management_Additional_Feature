from fastapi import HTTPException, status
from typing import Any, Optional

class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Any] = None
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "error_code": error_code,
                "message": message,
                "details": details
            }
        )

def invalid_credentials_error(message: str = "Invalid username or password") -> AppException:
    return AppException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        error_code="INVALID_CREDENTIALS",
        message=message
    )

def unauthorized_error(message: str = "Authentication required") -> AppException:
    return AppException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        error_code="UNAUTHORIZED",
        message=message
    )

def forbidden_error(message: str = "You do not have permission to perform this action") -> AppException:
    return AppException(
        status_code=status.HTTP_403_FORBIDDEN,
        error_code="FORBIDDEN",
        message=message
    )

def not_found_error(entity: str = "Resource", message: Optional[str] = None) -> AppException:
    return AppException(
        status_code=status.HTTP_404_NOT_FOUND,
        error_code="NOT_FOUND",
        message=message or f"{entity} not found"
    )

def student_not_found_error(message: str = "Student not found") -> AppException:
    return AppException(
        status_code=status.HTTP_404_NOT_FOUND,
        error_code="STUDENT_NOT_FOUND",
        message=message
    )

def invalid_qr_error(message: str = "Invalid or unverified QR token") -> AppException:
    return AppException(
        status_code=status.HTTP_400_BAD_REQUEST,
        error_code="INVALID_QR",
        message=message
    )

def qr_expired_error(message: str = "This QR code has expired. Please regenerate.") -> AppException:
    return AppException(
        status_code=status.HTTP_400_BAD_REQUEST,
        error_code="QR_EXPIRED",
        message=message
    )

def already_inside_error(message: str = "Student is already inside the hostel.") -> AppException:
    return AppException(
        status_code=status.HTTP_409_CONFLICT,
        error_code="ALREADY_INSIDE",
        message=message
    )

def already_outside_error(message: str = "Student is already outside the hostel.") -> AppException:
    return AppException(
        status_code=status.HTTP_409_CONFLICT,
        error_code="ALREADY_OUTSIDE",
        message=message
    )

def room_full_error(message: str = "Selected room is already at maximum capacity.") -> AppException:
    return AppException(
        status_code=status.HTTP_409_CONFLICT,
        error_code="ROOM_FULL",
        message=message
    )

def complaint_not_found_error(message: str = "Complaint record not found.") -> AppException:
    return AppException(
        status_code=status.HTTP_404_NOT_FOUND,
        error_code="COMPLAINT_NOT_FOUND",
        message=message
    )
