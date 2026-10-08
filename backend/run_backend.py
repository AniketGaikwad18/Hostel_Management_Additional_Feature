import uvicorn
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("=" * 60)
    print("  HOSTELSPHERE Backend Server")
    print("  'One Hostel. One Platform.'")
    print("  Binding: 0.0.0.0:8000")
    print("  Docs:    http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
