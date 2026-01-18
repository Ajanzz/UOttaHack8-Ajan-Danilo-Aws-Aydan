from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # This tells Pydantic to read from the .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Default values (can be overridden by .env)
    APP_ENV: str ="dev"
    CORS_ORIGINS: str ="http://localhost:5173/", "http://127.0.0.1:5173/"

    # API Keys
    OPENAI_API_KEY: str =""
    OPENAI_MODEL: str =""

    SURVEYMONKEY_ACCESS_TOKEN: str = ""
    SURVEYMONKEY_BASE_URL: str = ""


    def cors_list(self) -> List[str]:
        return [s.strip() for s in self.CORS_ORIGINS.split(",") if s.strip()]

settings = Settings()