from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_hub import ws_hub

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_hub.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for heartbeat or client pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect(websocket)
    except Exception:
        ws_hub.disconnect(websocket)
