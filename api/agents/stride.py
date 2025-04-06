from dataclasses import dataclass
from enum import Enum
from typing import List, Optional, Set, Dict, Any
from pydantic import BaseModel, Field, field_validator
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from api.config import config
from api.agents.relationship import Relationship
import uuid
# Define structured output models


class StrideCategory(str, Enum):
    SPOOFING = "Spoofing"
    TAMPERING = "Tampering"
    REPUDIATION = "Repudiation"
    INFORMATION_DISCLOSURE = "Information Disclosure"
    DENIAL_OF_SERVICE = "Denial of Service"
    ELEVATION_OF_PRIVILEGE = "Elevation of Privilege"


class Threat(BaseModel):
    id: str = Field(..., description="Unique identifier for this threat")
    category: StrideCategory = Field(..., description="Threat category")
    name: str = Field(..., description="Short descriptive name for this threat")
    scope: Relationship = Field(..., description="Specific relationships affected by this threat")
    impacts: str = Field( ..., description="Potential security impacts or consequences for this scenario")
    threat: str = Field(..., description="Brief summary of this specific threat")
    severity: str = Field(..., description="Estimated severity (Critical, High, Medium, Low)")
    likelihood: str = Field(..., description="Estimated likelihood (High, Medium, Low)")

    # @field_validator("category", mode="before")
    # @classmethod
    # def normalize_category(cls, value):
    #     if isinstance(value, str):
    #         return value.strip().title()
    #     return value

    class Config:
        arbitrary_types_allowed = True
        schema_extra = {
            "example": {
                "id": "TS-001",
                "name": "Unauthorized EC2 Access",
                "category": "Spoofing",
                            "scope": {
                                "source": "internet",
                                "target": "ec2",
                                "direction": "→",
                                "description": "Public access to EC2 instance"
                            },
                "impacts": "Unauthorized system access",
                "threat": "Attackers may gain unauthorized access to EC2 instances through brute force or exploiting vulnerabilities",
                "severity": "High",
                "likelihood": "Medium"
            }
        }
class Threats(BaseModel):
    threats: List[Threat] = Field(..., description="Collection of identified threats")

@dataclass
class Deps:
    relationship: Relationship

class StrideAgent:
    def __init__(self, api_keys: Dict[str, str] = None):
        self._init_agent()
        self.api_keys = api_keys

    def _init_agent(self):
        openai_api_key = self.api_keys.get("openai_api_key", config.OPENAI_API_KEY)
        
        model = OpenAIModel(
            model_name="gpt-4o-mini",
            api_key=openai_api_key
        )

        agent = Agent(
            model=model,
            system_prompt=[
                "You are a threat modeling expert using STRIDE methodology.",
                "",
                "Your task is to analyze the given relationship and metadata and generate Threat using STRIDE methodology",
                "Your analytic angle can be technical cyber security threats or threats from business logic flaws",
                "Do not make up threats that are not related to the relationship",
                "",
                "Here is the STRIDE methodology, use it as Category:",
                "- Spoofing",
                "- Tampering",
                "- Repudiation",
                "- Information Disclosure",
                "- Denial of Service",
                "- Elevation of Privilege",
                "",
                "When specifying the category, use the full name from the list above, spelled correctly and in title case.",
                "",
                "Analyze the given relationship and metadata and generate Threat using STRIDE methodology",
                "Provide your analysis in a structured format that will be used for deeper security research."
                ""
            ],
            result_type=Threats,
            deps_type=Deps,
        )

        @agent.tool
        async def analyze_threat_model(
            ctx: RunContext[Deps],
            id: str,
            name: str,
            category: str,
            impacts: str,
            summary: str,
            severity: str,
            likelihood: str
        ) -> Threats:
            """
            Analyze the user input to extract threat modeling components.

            Args:
                ctx: The run context containing the relationship
                id: Unique identifier for this threat
                name: Short descriptive name for this threat
                category: Threat category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
                impacts: Potential security impacts or consequences for this scenario
                summary: Brief summary of this specific threat
                severity: Estimated severity (Critical, High, Medium, Low)
                likelihood: Estimated likelihood (High, Medium, Low)

            Returns:
                Structured threat model with relationships, impacts, and techniques
            """
            relationship = ctx.deps.relationship
            id = str(uuid.uuid4())[:8]
            # Create scope as dictionary for compatibility
            scope_dict = {
                "source": relationship.source,
                "target": relationship.target,
                "direction": relationship.direction,
                "description": relationship.description
            }

            return Threat(
                id=id,
                name=name,
                category=category,
                scope=scope_dict,
                impacts=impacts,
                threat=summary,
                severity=severity,
                likelihood=likelihood
            )

        self.agent = agent

    async def run(self, relationship: Relationship, context: str) -> Threats:
        """
        Run the threat modeling analysis on the given user input

        Args:
            relationship: The relationship between components

        Returns:
            Structured threat model with relationships, impacts, and techniques
        """
        # Convert Relationship object to a dictionary
        # Create a simple string representation of the relationship
        prompt = f"""
        Analyze the security threats for a relationship from {relationship.source} to {relationship.target}.
        Context: {context}
        """

        deps = Deps(relationship=relationship)

        # Pass the dictionary to the agent with a specific parameter name
        result = await self.agent.run(prompt, deps=deps)

        # The analyze_threat_model tool will be called by the model and return a ThreatModelOutput
        return result
