import os
from pydantic_settings import BaseSettings

class Config(BaseSettings):
    OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
    GOOGLE_API_KEY: str = os.environ.get("GOOGLE_API_KEY", "")
    GOOGLE_CSE_ID: str = os.environ.get("GOOGLE_CSE_ID", "")
    LOGFIRE_API_KEY: str = os.environ.get("LOGFIRE_API_KEY", "")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()