from api.agents.input import InputAgent, Relationship
from api.agents.mitgation import MitigationAgent
from api.agents.relationship import RelationshipAgent
from api.agents.stride import StrideAgent
from api.agents.stride import Threat
from pydantic import BaseModel, Field
from datetime import datetime
from typing import AsyncGenerator, List, Dict, Any, Optional
import json
import asyncio

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

class MitigationRequest(BaseModel):
    threat: Threat
    context: str
class StrideRequest(BaseModel):
    relationships: List[Relationship]
    context: str
    
class ThreatModelRequest(BaseModel):
    user_input: str
    api_keys: Optional[Dict[str, str]] = Field(default_factory=dict)

def pydantic_to_json(obj):
    if hasattr(obj, 'model_dump'):
        return obj.model_dump()
    elif hasattr(obj, 'dict'):
        return obj.dict()
    return obj

async def analyze(request: ThreatModelRequest) -> AsyncGenerator[str, None]:
    """
    Streaming endpoint that orchestrates the relationship extraction and STRIDE threat generation
    with real-time updates as each threat is identified.
    """
    # Add initial debugging info to help trace execution
    yield f"data: {json.dumps({'type': 'debug', 'message': 'Stream started'})}\n\n"
    
    try:
        # Check for required API keys if provided
        if request.api_keys:
            if not request.api_keys.get('openai_api_key'):
                yield f"data: {json.dumps({'type': 'error', 'message': 'OpenAI API key is required'})}\n\n"
                return
            
            # Log that we're using client-provided keys
            yield f"data: {json.dumps({'type': 'debug', 'message': 'Using client-provided API keys'})}\n\n"
        
        # Step 1: Extract relationships using RelationshipAgent with API keys
        yield f"data: {json.dumps({'type': 'status', 'message': 'Extracting relationships from diagram and description...'})}\n\n"
        
        relationship_agent = RelationshipAgent(api_keys=request.api_keys)
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
        
        # Step 3: Analyze each relationship with STRIDE, passing API keys
        stride_agent = StrideAgent(api_keys=request.api_keys)
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
        
        # Step 4: Research for mitigation for each threat, passing API keys
        yield f"data: {json.dumps({'type': 'status', 'message': f'Starting mitigation research for {len(all_threats)} threats...'})}\n\n"
        
        mitigation_agent = MitigationAgent(api_keys=request.api_keys)
        for i, threat in enumerate(all_threats):
            # Notify client which threat we're researching mitigations for
            yield f"data: {json.dumps({'type': 'mitigation_started', 'threat_id': threat.id, 'message': f'Researching mitigation for: {threat.name}'})}\n\n"
            
            try:
                # Call the mitigation agent with the threat and context
                mitigation_result = await mitigation_agent.run(threat, context)
                
                # Extract mitigation content and sources from the result
                content = "No specific mitigation found."
                sources = []
                
                if hasattr(mitigation_result, 'data'):
                    data = mitigation_result.data
                    if hasattr(data, 'content'):
                        content = data.content
                    if hasattr(data, 'sources'):
                        sources = data.sources
                
                # Send structured format with nested mitigation object to match client expectations
                yield f"data: {json.dumps({
                    'type': 'mitigation_complete', 
                    'threat_id': threat.id, 
                    'mitigation': {
                        'content': content, 
                        'sources': sources
                    }
                })}\n\n"
                
                # Small delay between mitigations
                await asyncio.sleep(0.2)
                
            except Exception as e:
                yield f"data: {json.dumps({'type': 'mitigation_error', 'threat_id': threat.id, 'error': str(e)})}\n\n"
        
        # Step 5: Signal completion and return summary
        yield f"data: {json.dumps({'type': 'process_complete', 'message': 'Threat modeling and mitigation research complete', 'total_threats': len(all_threats)})}\n\n"
    
    except Exception as e:
        # Catch any top-level exceptions and report them
        yield f"data: {json.dumps({'type': 'error', 'message': f'Stream processing error: {str(e)}'})}\n\n"