from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="JOURNAL_")

    env: str = "dev"
    db_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/journal"
    redis_url: str = "redis://localhost:6379/0"
    nats_url: str = "nats://localhost:4222"
    otlp_endpoint: str = "http://localhost:4317"

    jwt_secret: str = "change_me"
    jwt_iss: str = "journal-api"
    jwt_aud: str = "journal-clients"
    access_token_minutes: int = 15
    refresh_token_days: int = 30

settings = Settings()
