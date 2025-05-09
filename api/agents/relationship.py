from dataclasses import dataclass
from typing import List, Optional, Set, Dict, Any
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

class RelationshipModelOutput(BaseModel):
    relationships: List[Relationship] = Field(..., description="Collection of identified relationships")
    context: str = Field(..., description="Context summary about the user's input")
    
    class Config:
        schema_extra = {
            "examples": [
                {
                    "relationships": [
                        {"source": "internet", "target": "ec2", "direction": "→", "description": "Public access to EC2 instance"}
                    ],
                    "context": "The system is a web application that allows users to manage their finances. It is hosted on an EC2 instance and has a public-facing internet endpoint."
                }
            ]
        }

@dataclass
class Deps:
    user_input: str

class RelationshipAgent:
    def __init__(self, api_keys: Dict[str, str] = None):
        self.api_keys = api_keys
        self._init_agent()

    def _init_agent(self):
        openai_api_key = self.api_keys.get("openai_api_key", config.OPENAI_API_KEY)
        
        model = OpenAIModel(
            model_name="gpt-4o",
            api_key=openai_api_key
        )
        
        agent = Agent(
            model=model,
            system_prompt=[
                "You are a specialized infrastructure and application security expert.",
                "Your tasks are:",
                "1. RELATIONSHIPS: Identify relationships between components from the user input with technical specificity:",
                "   - Identify exact interfaces and data flows (e.g., 'Client authentication to Authorization Server via HTTPS')",
                "   - Specify the technical protocols or methods used in each relationship",
                "   - Include trust assumptions and security boundaries being crossed",
                "   - Note specific data elements or credentials being exchanged",
                "",
                "2. CONTEXT: Provide a detailed technical summary including:",
                "   - Specific technologies and protocols mentioned or implied",
                "   - Authentication and authorization mechanisms",
                "   - Data types being protected or transmitted",
                "   - Technical environment and implementation details",
                "",
                "Be technically precise without making assumptions not present in the input.",
                "Identify as many specific, technical relationships as possible to enable detailed threat modeling."
            ],
            result_type=RelationshipModelOutput,
            deps_type=str,
        )
        
        @agent.tool
        async def analyze_relationship(ctx: RunContext, user_input: str) -> RelationshipModelOutput:
            """
            Analyze the user input to extract infrastructure and application security components.
            
            Args:
                ctx: The run context
                user_input: The user's description of their system or security concern
                
            Returns:
                Structured infrastructure and application security model with relationships, and context
            """
            # This is just a placeholder - the actual implementation will be done by the model
            return RelationshipModelOutput(
                relationships=[
                    Relationship(
                        source="internet",
                        target="ec2",
                        direction="→",
                        description="Public access to EC2 instance"
                    )
                ],
                context="The system is a web application that allows users to manage their finances. It is hosted on an EC2 instance and has a public-facing internet endpoint."
            )

        self.agent = agent

    async def run(self, user_input: str) -> RelationshipModelOutput:
        """
        Run the relationship analysis on the given user input
        
        Args:
            user_input: The user's description of their system or security concern
            
        Returns:
            Structured relationships
        """
        result = await self.agent.run(user_input)
        
        # The analyze_relationship tool will be called by the model and return a RelationshipModelOutput
        return result
        