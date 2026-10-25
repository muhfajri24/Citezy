import os
from typing import List
from dotenv import load_dotenv

# Load .env file if available
load_dotenv()


class Settings:
    NEBIUS_API_KEY: str = os.getenv("NEBIUS_API_KEY", "")
    NEBIUS_BASE_URL: str = os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.nebius.ai/v1")
    NEMOTRON_MODEL_ID: str = os.getenv("NEMOTRON_MODEL_ID", "nvidia/nemotron-4-340b-instruct")

    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

    MAX_SOURCES: int = int(os.getenv("MAX_SOURCES", "8"))
    MAX_CLAIMS: int = int(os.getenv("MAX_CLAIMS", "25"))
    MAX_EXECUTION_TIMEOUT_SECONDS: int = int(os.getenv("MAX_EXECUTION_TIMEOUT_SECONDS", "180"))

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]


settings = Settings()
