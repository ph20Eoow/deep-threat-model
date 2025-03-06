from fastapi import APIRouter
from agents.input import InputAgent
from agents.research import ResearchAgent
from pydantic import BaseModel, Field
from datetime import datetime
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
