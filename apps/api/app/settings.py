from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="JOURNAL_")

    env: str = "dev"
    db_url: str = "postgresql+asyncpg://journal:journal@localhost:5433/journal"
    redis_url: str = "redis://localhost:6380/0"
    nats_url: str = "nats://localhost:4222"
    otlp_endpoint: str = "http://localhost:4317"

    jwt_secret: str = "change_me"  # noqa: S105 - dev default; override via env in production
    jwt_iss: str = "journal-api"
    jwt_aud: str = "journal-clients"
    access_token_minutes: int = 15
    refresh_token_days: int = 30

    testing: bool = False
    auto_embed_mode: str = "event"  # "event" | "inline" | "off"
    # Feature flags
    user_mgmt_enabled: bool = False

    # Demo credentials for development/testing (override via env in real deployments)
    demo_username: str = "demo"
    demo_password: str = ""  # Set JOURNAL_DEMO_PASSWORD in env for non-empty


settings = Settings()
