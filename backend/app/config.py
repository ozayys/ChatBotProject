from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database settings - MySQL
    db_host: str = "localhost"
    db_port: int = 3306
    db_database: str = "mathchatdb"
    db_username: str = "root"  # Default MySQL root username
    db_password: str = ""      # MySQL root password - boş varsayıyorum, gerekirse değiştirin
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    
    # JWT settings
    secret_key: str = "chatbot-token-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "allow"
    }

@lru_cache()
def get_settings():
    return Settings()