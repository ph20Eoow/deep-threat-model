from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from agents.input import InputAgent
from agents.research import ResearchAgent
from pydantic import BaseModel, Field
from datetime import datetime
from typing import AsyncGenerator
import json
import asyncio

router = APIRouter(prefix="/tm", tags=["Threat Modeling"])

class ChatResponseKwargs(BaseModel):
    content: str
    created_at: str

class ChatResponse(BaseModel):
    id: str
    kwargs: ChatResponseKwargs = Field(alias="kwargs")

class ChatRequest(BaseModel):
    diagram: str
    description: str
    assumptions: str

class ResearchRequest(BaseModel):
    topic: str

@router.get("/")
async def get_threats():
    return {"message": "Welcome to the Threat Modeling API!"}

def pydantic_to_json(obj):
    if hasattr(obj, 'model_dump'):
        return obj.model_dump()
    elif hasattr(obj, 'dict'):
        return obj.dict()
    return obj

async def threat_model_stream(request: ChatRequest) -> AsyncGenerator[str, None]:
    # Add initial debugging info to help trace execution
    yield f"data: {json.dumps({'type': 'debug', 'message': 'Stream started'})}\n\n"
    
    try:
        # Step 1: Run the initial threat model
        input_agent = InputAgent()
        initial_result = await input_agent.run(request.diagram, request.description, request.assumptions)
        
        # Debug what we received from the input agent
        yield f"data: {json.dumps({'type': 'debug', 'message': 'Input agent completed'})}\n\n"
        
        # Step 2: Send initial results without mitigations
        # Convert Pydantic model to dict first
        if hasattr(initial_result, 'data'):
            result_dict = pydantic_to_json(initial_result.data)
            yield f"data: {json.dumps({'type': 'initial_results', 'data': result_dict})}\n\n"
        else:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Failed to generate initial threat model'})}\n\n"
            return
        
        # Step 3: For each threat, perform research and stream results
        research_agent = ResearchAgent()
        
        for i, threat in enumerate(initial_result.data.threat_scenarios):
            # Notify client which threat we're researching
            yield f"data: {json.dumps({'type': 'research_started', 'threat_id': threat.id, 'message': f'Researching mitigation for: {threat.name}'})}\n\n"
            
            try:
                # Create a focused research topic based on the threat
                research_topic = f"Mitigation strategies for {threat.name}: {threat.summary}"
                
                # Call the research agent with the correct parameter
                research_result = await research_agent.run(research_topic)
                
                # Add a small delay to make the streaming visible to users
                await asyncio.sleep(0.5)
                
                # Extract mitigation from research result
                mitigation = "No specific mitigation found."
                if hasattr(research_result, 'data'):
                    if hasattr(research_result.data, 'mitigation'):
                        mitigation = research_result.data.mitigation
                    elif hasattr(research_result.data, 'content'):
                        mitigation = research_result.data.content
                    elif isinstance(research_result.data, str):
                        mitigation = research_result.data
                
                # Stream the research results
                yield f"data: {json.dumps({'type': 'research_complete', 'threat_id': threat.id, 'mitigation': mitigation})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'research_error', 'threat_id': threat.id, 'error': str(e)})}\n\n"
        
        # Signal completion
        yield f"data: {json.dumps({'type': 'process_complete', 'message': 'Threat modeling and research complete'})}\n\n"
    
    except Exception as e:
        # Catch any top-level exceptions and report them
        yield f"data: {json.dumps({'type': 'error', 'message': f'Stream processing error: {str(e)}'})}\n\n"

@router.post("/stream")
async def stream_threat_model(request: ChatRequest):
    return StreamingResponse(
        threat_model_stream(request),
        media_type="text/event-stream"
    )

@router.post("/")
async def init_threat_model(request: ChatRequest):
    agent = InputAgent()
    result = await agent.run(request.diagram, request.description, request.assumptions)
    return result.data

@router.post("/research")
async def research_threat_model(request: ResearchRequest):
    research_agent = ResearchAgent()
    result = await research_agent.run(request.topic)
    return result.data
