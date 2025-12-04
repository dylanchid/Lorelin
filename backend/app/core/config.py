import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Lorelin VoB API"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./database.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # App Settings
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "False").lower() == "true"
    
    # Stedi
    STEDI_API_KEY: str = os.getenv("STEDI_API_KEY", "")
    STEDI_BASE_URL: str = "https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3"

    # Browserbase
    BROWSERBASE_PROJECT_ID: str = os.getenv("BROWSERBASE_PROJECT_ID", "")
    BROWSERBASE_API_KEY: str = os.getenv("BROWSERBASE_API_KEY", "")
    
    # RPA
    RPA_PORTAL_URL: str = os.getenv("RPA_PORTAL_URL", "http://localhost:5001")

    # LLM (Claude)
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # LLM (Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")

    # AWS (S3 Artifacts)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_BUCKET_NAME: str = os.getenv("AWS_BUCKET_NAME", "lorelin-rpa-artifacts")

settings = Settings()
