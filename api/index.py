from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json
import asyncio

# Suppress logfire warning
import sys
import os
os.environ["LOGFIRE_IGNORE_NO_CONFIG"] = "1"
os.environ["PYTHONUNBUFFERED"] = "1"

print(f"Current working directory: {os.getcwd()}")
print(f"Python path: {sys.path}")

from api.services import tm

app = FastAPI(
    title="API for deep-tm",
    description="API for deep-tm",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api", tags=["Core API"])

# Create a wrapper for tm.analyze that converts its format to Vercel's format
async def vercel_compatible_stream(request: tm.ThreatModelRequest):
    """Convert standard SSE stream to Vercel AI SDK format"""
    try:
        # Forward the standard SSE data but with Vercel's protocol
        async for chunk in tm.analyze(request):
            # Original format: "data: {"type": "debug", "message": "Stream started"}\n\n"
            # Parse the SSE data
            if chunk.startswith("data: "):
                data_str = chunk[len("data: "):-2]  # Remove "data: " prefix and "\n\n" suffix
                try:
                    data = json.loads(data_str)
                    
                    # Convert to Vercel format based on type
                    if data["type"] == "debug" or data["type"] == "status":
                        # For debug messages, use type 0 (text)
                        yield f'0:{json.dumps(data["message"])}\n'
                    elif data["type"] == "relationships" or data["type"] == "threat_identified":
                        # For content data, use type 0 (text) but with complete object
                        yield f'0:{json.dumps(data)}\n'
                    elif data["type"] == "error":
                        # For errors, use type 0 but include error info
                        yield f'0:{json.dumps({"error": data["message"]})}\n'
                    elif data["type"] == "process_complete":
                        # Final message - send completion
                        yield f'e:{{"finishReason":"stop","usage":{{"promptTokens":0,"completionTokens":0}},"isContinued":false}}\n'
                    else:
                        # For other types, pass through as type 0
                        yield f'0:{json.dumps(data)}\n'
                except json.JSONDecodeError:
                    # If not valid JSON, just pass through
                    yield f'0:{json.dumps(data_str)}\n'
            else:
                # Pass through non-data chunks
                yield f'0:{json.dumps(chunk)}\n'
                
        # Ensure we send a final completion message if not already sent
        yield f'e:{{"finishReason":"stop","usage":{{"promptTokens":0,"completionTokens":0}},"isContinued":false}}\n'
            
    except Exception as e:
        # Handle any exceptions
        yield f'0:{json.dumps({"error": str(e)})}\n'
        yield f'e:{{"finishReason":"error","usage":{{"promptTokens":0,"completionTokens":0}},"isContinued":false}}\n'

@router.post("/stream/stride")
async def stream_stride_threats(request: tm.ThreatModelRequest):
    """
    Streaming endpoint for the relationship extraction and STRIDE threat generation process.
    """
    print(f"Received request: {request}")
    
    # Use Vercel's specific format
    response = StreamingResponse(
        vercel_compatible_stream(request),
        media_type="text/plain",  # Different from SSE's media type
    )
    
    # Add the critical Vercel header
    response.headers['x-vercel-ai-data-stream'] = 'v1'
    
    return response

@router.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="0.0.0.0", port=5328, reload=True)