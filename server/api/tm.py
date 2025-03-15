from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from agents.input import InputAgent, Relationship
from agents.mitgation import MitigationAgent
from agents.relationship import RelationshipAgent
from agents.stride import StrideAgent
from pydantic import BaseModel, Field
from datetime import datetime
from typing import AsyncGenerator, List
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
    model: str
    diagram: str
    description: str
    assumptions: str

class ResearchRequest(BaseModel):
    user_input: str

class StrideRequest(BaseModel):
    relationships: List[Relationship]
    context: str
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
        # Step 0: Set the model
        model = request.model
        if model == "stride":
            input_agent = InputAgent()
        elif model == "dread":
            yield f"data: {json.dumps({'type': 'error', 'message': 'threat modeling not supported for DREAD at this time'})}\n\n"
            return
        
        # Step 1: Run the initial threat model
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
        research_agent = MitigationAgent()
        
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

# Dev endpoint
@router.post("/relationship")
async def research_threat_model(request: ResearchRequest):
    agent = RelationshipAgent()
    result = await agent.run(request.user_input)
    return result.data

@router.post("/stride")
async def pipeline_stride(request: StrideRequest):
    agent = StrideAgent()
    results = []
    for relationship in request.relationships:
        print(f"Processing relationship: {relationship}")
        result = await agent.run(relationship, request.context)
        results.extend(result.data.threats)
    return results


async def relationship_stride_stream(request: ResearchRequest) -> AsyncGenerator[str, None]:
    """
    Streaming endpoint that orchestrates the relationship extraction and STRIDE threat generation
    with real-time updates as each threat is identified.
    """
    # Add initial debugging info to help trace execution
    yield f"data: {json.dumps({'type': 'debug', 'message': 'Stream started'})}\n\n"
    
    try:
        # Step 1: Extract relationships using RelationshipAgent
        yield f"data: {json.dumps({'type': 'status', 'message': 'Extracting relationships from diagram and description...'})}\n\n"
        
        relationship_agent = RelationshipAgent()
        relationship_result = await relationship_agent.run(request.user_input)
        
        if not hasattr(relationship_result, 'data') or not hasattr(relationship_result.data, 'relationships'):
            yield f"data: {json.dumps({'type': 'error', 'message': 'Failed to extract relationships'})}\n\n"
            return
            
        relationships = relationship_result.data.relationships
        context = relationship_result.data.context
        
        # Step 2: Send the extracted relationships
        yield f"data: {json.dumps({'type': 'relationships', 'data': [pydantic_to_json(r) for r in relationships]})}\n\n"
        
        # Use context from request if provided, otherwise use context from relationship result
        yield f"data: {json.dumps({'type': 'debug', 'message': f'Using context: {context}'})}\n\n"
        
        # Step 3: Analyze each relationship with STRIDE
        stride_agent = StrideAgent()
        all_threats = []
        
        for i, relationship in enumerate(relationships):
            # Notify client which relationship we're analyzing
            yield f"data: {json.dumps({'type': 'analyzing_relationship', 'index': i, 'relationship': pydantic_to_json(relationship)})}\n\n"
            
            try:
                # Process relationship and generate threats
                result = await stride_agent.run(relationship, context)
                
                # For each threat in the result, stream it out
                for threat in result.data.threats:
                    # Add the threat to our overall collection
                    all_threats.append(threat)
                    
                    # Stream this individual threat
                    yield f"data: {json.dumps({'type': 'threat_identified', 'threat': pydantic_to_json(threat)})}\n\n"
                    
                    # Add a tiny delay to make the streaming visible to users
                    await asyncio.sleep(0.1)
                
            except Exception as e:
                yield f"data: {json.dumps({'type': 'relationship_error', 'index': i, 'error': str(e)})}\n\n"
        
        # Step 4: Research for mitigation for each threat
        yield f"data: {json.dumps({'type': 'status', 'message': f'Starting mitigation research for {len(all_threats)} threats...'})}\n\n"
        
        mitigation_agent = MitigationAgent()
        for i, threat in enumerate(all_threats):
            # Notify client which threat we're researching mitigations for
            yield f"data: {json.dumps({'type': 'research_started', 'threat_id': threat.id, 'message': f'Researching mitigation for: {threat.name}'})}\n\n"
            
            try:
                # Create a mitigation research prompt based on the threat
                mitigation_prompt = (
                    f"Research mitigation strategies for the following threat:\n\n"
                    f"Name: {threat.name}\n"
                    f"Category: {threat.category}\n"
                    f"Relationship: {threat.scope.source} {threat.scope.direction} {threat.scope.target}\n"
                    f"Description: {threat.scope.description}\n"
                    f"Threat Details: {threat.threat}\n"
                    f"Impacts: {threat.impacts}\n"
                    f"Severity: {threat.severity}\n"
                    f"Context: {context}\n\n"
                    f"Provide specific, actionable mitigation strategies for this threat."
                )
                
                # Call the mitigation agent with the created prompt
                mitigation_result = await mitigation_agent.run(mitigation_prompt)
                
                # Extract mitigation content from the result
                mitigation = "No specific mitigation found."
                if hasattr(mitigation_result, 'data'):
                    if hasattr(mitigation_result.data, 'mitigation'):
                        mitigation = mitigation_result.data.mitigation
                    elif hasattr(mitigation_result.data, 'content'):
                        mitigation = mitigation_result.data.content
                    elif isinstance(mitigation_result.data, str):
                        mitigation = mitigation_result.data
                
                # Stream the mitigation results
                yield f"data: {json.dumps({'type': 'research_complete', 'threat_id': threat.id, 'mitigation': mitigation})}\n\n"
                
                # Small delay between mitigations
                await asyncio.sleep(0.2)
                
            except Exception as e:
                yield f"data: {json.dumps({'type': 'research_error', 'threat_id': threat.id, 'error': str(e)})}\n\n"
        
        # Step 5: Signal completion and return summary
        yield f"data: {json.dumps({'type': 'process_complete', 'message': 'Threat modeling and mitigation research complete', 'total_threats': len(all_threats)})}\n\n"
    
    except Exception as e:
        # Catch any top-level exceptions and report them
        yield f"data: {json.dumps({'type': 'error', 'message': f'Stream processing error: {str(e)}'})}\n\n"

@router.post("/stream/stride")
async def stream_stride_threats(request: ResearchRequest):
    """
    Streaming endpoint for the relationship extraction and STRIDE threat generation process.
    """
    return StreamingResponse(
        relationship_stride_stream(request),
        media_type="text/event-stream"
    )