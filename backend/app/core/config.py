from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Interactive Courses API"
    environment: str = "development"
    database_url: str | None = None
    allowed_origins: list[str] = ["http://localhost:5173"]
    jwt_secret: str | None = None
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    require_verified_email: bool = True
    email_verification_minutes: int = 60 * 24
    password_reset_minutes: int = 30
    frontend_url: str = "http://localhost:5173"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
