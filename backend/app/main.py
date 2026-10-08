from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.errors import AppException
from app.database.session import engine, Base
from app.database.seed import seed_database

# Routers
from app.api import (
    auth, qr, movement, warden, students, complaints,
    rooms, fees, fines, announcements, emergency, leave, ws
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="HOSTELSPHERE - One Hostel. One Platform. Modern University Hostel Management System.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware - allows any phone/laptop on same Wi-Fi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": str(exc) or "An unexpected server error occurred.",
            "details": None
        }
    )

# Health check
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION
    }

# Include API Routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(qr.router, prefix=api_prefix)
app.include_router(movement.router, prefix=api_prefix)
app.include_router(warden.router, prefix=api_prefix)
app.include_router(students.router, prefix=api_prefix)
app.include_router(complaints.router, prefix=api_prefix)
app.include_router(rooms.router, prefix=api_prefix)
app.include_router(fees.router, prefix=api_prefix)
app.include_router(fines.router, prefix=api_prefix)
app.include_router(announcements.router, prefix=api_prefix)
app.include_router(emergency.router, prefix=api_prefix)
app.include_router(leave.router, prefix=api_prefix)
app.include_router(ws.router)
