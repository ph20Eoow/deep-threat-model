from pydantic_settings import BaseSettings

class ConfigDb(BaseSettings):
    OPENAI_API_KEY: str
    GOOGLE_API_KEY: str
    GOOGLE_CSE_ID: str
    LOGFIRE_API_KEY: str
    class Config:
        env_file = ""
        case_sensitive = False
        env_file = ".env"
        extra = "allow"

config = ConfigDb()