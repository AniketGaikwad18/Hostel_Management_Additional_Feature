import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database import models
from app.schemas.misc import AnnouncementCreate, AnnouncementOut
from app.schemas.common import StandardResponse
from app.core.security import require_warden, get_current_user_payload
from app.core.websocket_hub import ws_hub

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("", response_model=StandardResponse[List[AnnouncementOut]])
def list_announcements(db: Session = Depends(get_db)):
    items = db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()
    results = [
        AnnouncementOut(
            id=a.id,
            title=a.title,
            content=a.content,
            priority=a.priority,
            target_audience=a.target_audience,
            created_at=a.created_at,
            warden_name=a.warden.user.full_name if a.warden else "Hostel Administration"
        ) for a in items
    ]
    return StandardResponse(success=True, data=results)

@router.post("", response_model=StandardResponse[AnnouncementOut])
async def create_announcement(req: AnnouncementCreate, payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    warden_id = payload.get("warden_id")
    ann = models.Announcement(
        id=str(uuid.uuid4()),
        warden_id=warden_id,
        title=req.title,
        content=req.content,
        priority=req.priority.upper(),
        target_audience=req.target_audience.upper(),
        created_at=datetime.now(timezone.utc)
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)

    await ws_hub.broadcast({
        "type": "ANNOUNCEMENT_POSTED",
        "payload": {
            "id": ann.id,
            "title": ann.title,
            "content": ann.content,
            "priority": ann.priority
        }
    })

    out = AnnouncementOut(
        id=ann.id,
        title=ann.title,
        content=ann.content,
        priority=ann.priority,
        target_audience=ann.target_audience,
        created_at=ann.created_at,
        warden_name=payload.get("full_name", "Warden")
    )
    return StandardResponse(success=True, data=out, message="Announcement broadcasted")
