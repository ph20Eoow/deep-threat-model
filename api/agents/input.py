from dataclasses import dataclass
from typing import List, Optional, Set
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from api.config import config

# Define structured output models
class Relationship(BaseModel):
    source: str = Field(..., description="Source component or entity")
    target: str = Field(..., description="Target component or entity")
    direction: str = Field(..., description="Direction of relationship (e.g., '→', '←', '↔')")
    description: Optional[str] = Field(None, description="Additional details about this relationship")

class ThreatScenario(BaseModel):
    id: str = Field(..., description="Unique identifier for this threat scenario")
    name: str = Field(..., description="Short descriptive name for this threat scenario")
    scope: Relationship = Field(..., description="Specific relationships affected by this threat")
    impacts: str = Field(..., description="Potential security impacts or consequences for this scenario")
    techniques: str = Field(..., description="Attack techniques or vectors that could be used in this scenario")
    summary: str = Field(..., description="Brief summary of this specific threat scenario")
    severity: str = Field(..., description="Estimated severity (Critical, High, Medium, Low)")
    likelihood: str = Field(..., description="Estimated likelihood (High, Medium, Low)")

class ThreatModelOutput(BaseModel):
    system_overview: str = Field(..., description="High-level overview of the analyzed system")
    threat_scenarios: List[ThreatScenario] = Field(..., description="Collection of identified threat scenarios")
    
    class Config:
        schema_extra = {
            "examples": [
                {
                    "system_overview": "The system consists of EC2 instances accessible from the internet with an attached database",
                    "threat_scenarios": [
                        {
                            "id": "TS-001",
                            "name": "Unauthorized EC2 Access",
                            "scope": [
                                {"source": "internet", "target": "ec2", "direction": "→", "description": "Public access to EC2 instance"}
                            ],
                            "impacts": "Unauthorized system access",
                            "techniques": "SSH brute force",
                            "summary": "Attackers may gain unauthorized access to EC2 instances through brute force or exploiting vulnerabilities",
                            "severity": "High",
                            "likelihood": "Medium"
                        }
                    ]
                }
            ]
        }

@dataclass
class Deps:
    user_input: str

class InputAgent:
    def __init__(self):
        self._init_agent()

    def _init_agent(self):
        model = OpenAIModel(
            model_name="gpt-4o",
            api_key=config.OPENAI_API_KEY
        )
        
        agent = Agent(
            model=model,
            system_prompt=[
                "You are a specialized security expert focused on threat modeling for systems and applications.",
                "",
                "Your task is to analyze user input and extract critical threat model components:",
                "1. RELATIONSHIPS: Identify relationships between components (such as 'ec2 <- internet' or 'database → API').",
                "2. IMPACTS: Determine potential security impacts if compromised (such as 'exposure of ec2 ip address' or 'unauthorized data access').",
                "3. TECHNIQUES: Identify possible attack techniques (such as 'ec2 metadata exposure' or 'SQL injection').",
                "",
                "Analyze any system descriptions, architecture diagrams, or security concerns provided by the user.",
                "If diagrams are provided, extract relationships between components.",
                "Think through realistic attack vectors based on the components and their relationships.",
                "Focus on practical, high-priority threats rather than theoretical edge cases.",
                "",
                "Provide your analysis in a structured format that will be used for deeper security research."
            ],
            result_type=ThreatModelOutput,
            deps_type=str,
        )
        
        @agent.tool
        async def analyze_threat_model(ctx: RunContext, user_input: str) -> ThreatModelOutput:
            """
            Analyze the user input to extract threat modeling components.
            
            Args:
                ctx: The run context
                user_input: The user's description of their system or security concern
                
            Returns:
                Structured threat model with relationships, impacts, and techniques
            """
            # This is just a placeholder - the actual implementation will be done by the model
            return ThreatModelOutput(
                system_overview="The system consists of EC2 instances accessible from the internet",
                threat_scenarios=[
                    ThreatScenario(
                        id="TS-001",
                        name="Unauthorized EC2 Access",
                        scope=Relationship(source="internet", target="ec2", direction="→", 
                                        description="Public access to EC2 instance"),
                        impacts="Exposure of EC2 IP address",
                        techniques="EC2 metadata exposure",
                        summary="Attackers may gain unauthorized access to EC2 instances through brute force or exploiting vulnerabilities",
                        severity="High",
                        likelihood="Medium"
                    )
                ]
            )

        self.agent = agent

    async def run(self, diagram: str, description: str, assumptions: str) -> ThreatModelOutput:
        """
        Run the threat modeling analysis on the given user input
        
        Args:
            user_input: The user's description of their system or security concern
            
        Returns:
            Structured threat model with relationships, impacts, and techniques
        """
        user_input = f"Diagram: {diagram}\nDescription: {description}\nAssumptions: {assumptions}"
        result = await self.agent.run(user_input)
        
        # The analyze_threat_model tool will be called by the model and return a ThreatModelOutput
        return result
        