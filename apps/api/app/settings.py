from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="JOURNAL_")

    env: str = "dev"
    db_url: str = "postgresql+asyncpg://journal:journal@localhost:5433/journal"  # Legacy, kept for compatibility
    db_url_async: str = "postgresql+asyncpg://journal:journal@localhost:5433/journal"
    db_url_sync: str = "postgresql+psycopg://journal:journal@localhost:5433/journal"
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
    auth_require_email_verify: bool = True
    rate_limit_window_seconds: int = 60
    rate_limit_max_attempts: int = 5

    auth_cookie_refresh: bool = False
    csrf_cookie_name: str = "csrftoken"
    refresh_cookie_name: str = "refresh_token"
    cookie_secure_default: bool = True
    cookie_samesite: str = "lax"  # "lax" | "strict" | "none"
    cookie_path: str = "/api/v1/auth"

    # Demo credentials for development/testing (override via env in real deployments)
    demo_username: str = "demo"
    demo_password: str = ""  # Set JOURNAL_DEMO_PASSWORD in env for non-empty
    
    # WebAuthn/Passkeys configuration
    webauthn_rp_id: str = "localhost"  # Relying Party ID (domain without port)
    webauthn_rp_name: str = "Journal App"  # Display name for the app
    webauthn_origin: str = "http://localhost:3000"  # Expected origin for verification


settings = Settings()
