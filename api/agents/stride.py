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
    name: str = Field(..., description="Specific name describing the attack method")
    scope: Relationship = Field(..., description="Specific relationships affected by this threat")
    impacts: str = Field(..., description="Potential security impacts or consequences for this scenario")
    threat: str = Field(..., description="Technical description of this specific threat")
    attack_vectors: str = Field(..., description="Specific methods an attacker would use to exploit this vulnerability")
    prerequisites: str = Field(..., description="Conditions necessary for this attack to be possible")
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
                "You are a threat modeling expert using STRIDE methodology.",
                "",
                "Your task is to analyze the given relationship and identify highly specific technical threats using STRIDE methodology.",
                "Generate threats that describe concrete attack scenarios with precise technical details, not just abstract categories.",
                "",
                "When analyzing, consider:",
                "1. Component-specific vulnerabilities - What exact weaknesses in this component could be exploited?",
                "2. Protocol-level attacks - What protocol-specific manipulation could occur?",
                "3. Implementation flaws - What common coding mistakes create vulnerabilities?",
                "4. Data flow weaknesses - How could data be intercepted, modified, or leaked?",
                "5. Trust boundary violations - How could trust assumptions be broken?",
                "",
                "For each threat, provide:",
                "- A specific name describing the exact attack method (e.g., 'Eavesdropping Access Tokens' not just 'Information Disclosure')",
                "- Detailed attack vectors describing precise technical exploitation methods",
                "- Implementation context and prerequisites necessary for the attack",
                "- Concrete technical impacts specific to the relationship",
                "",
                "Here is the STRIDE methodology for categorization:",
                "- Spoofing: Pretending to be someone/something else",
                "- Tampering: Unauthorized modification of data/communications",
                "- Repudiation: Denying having performed an action",
                "- Information Disclosure: Exposing information to unauthorized parties",
                "- Denial of Service: Preventing legitimate access",
                "- Elevation of Privilege: Gaining capabilities beyond authorization",
                "",
                "Be highly technical, specific, and precise in your threat descriptions.",
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
            attack_vectors: str,
            prerequisites: str,
            severity: str,
            likelihood: str
        ) -> Threats:
            """
            Analyze the relationship to identify specific, technical threats.

            Args:
                ctx: The run context containing the relationship
                id: Unique identifier for this threat
                name: Name describing the specific attack method (not just the category)
                category: STRIDE category
                impacts: Business and technical impact of this threat
                summary: Technical details of how this attack would be executed
                attack_vectors: Specific methods an attacker would use to exploit this vulnerability
                prerequisites: Conditions necessary for this attack to be possible
                severity: Estimated severity (Critical, High, Medium, Low)
                likelihood: Estimated likelihood (High, Medium, Low)

            Returns:
                Structured threat model with detailed technical assessment
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
                attack_vectors=attack_vectors,
                prerequisites=prerequisites,
                severity=severity,
                likelihood=likelihood
            )

        self.agent = agent

    async def run(self, relationship: Relationship, context: str) -> Threats:
        """
        Run the threat modeling analysis on the given relationship
        """
        # Create a detailed prompt
        prompt = f"""
        Analyze the security threats for the relationship from {relationship.source} to {relationship.target}.
        
        Component details:
        - Source component: {relationship.source} 
          - Consider its implementation details, typical vulnerabilities, and trust assumptions
        
        - Target component: {relationship.target}
          - Consider what it protects, how it validates requests, and potential implementation weaknesses
        
        - Relationship type: {relationship.direction}
          - Consider data flows, authentication methods, and protocol-specific attacks
        
        - Relationship details: {relationship.description}
        
        Additional technical context: {context}
        
        For each threat:
        1. Name it after the specific attack technique, not just the category
        2. Describe exact technical methods an attacker would use
        3. Specify implementation assumptions or conditions necessary for the attack
        4. Detail precise technical impacts on confidentiality, integrity, or availability
        
        Aim for the level of technical specificity found in security RFCs and formal threat models.
        """

        deps = Deps(relationship=relationship)
        result = await self.agent.run(prompt, deps=deps)
        return result
