from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add debugging for imports
import sys
import os
print(f"Current working directory: {os.getcwd()}")
print(f"Python path: {sys.path}")

# Try absolute imports with explicit paths
from api.services import tm

# Define the app
app = FastAPI(
    title="API for deep-tm",
    description="API for deep-tm",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, in production specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ThreatModelRequest(BaseModel):
    user_input: str

router = APIRouter(prefix="/api", tags=["Core API"])

@router.post("/stream/stride")
async def stream_stride_threats(request: ThreatModelRequest):
    """
    Streaming endpoint for the relationship extraction and STRIDE threat generation process.
    """
    return StreamingResponse(
        tm.analyze(request),
        media_type="text/event-stream"
    )
# Include router
app.include_router(router)

# Add a health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="0.0.0.0", port=5328, reload=True)