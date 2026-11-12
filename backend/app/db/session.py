from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings


def _async_database_url(url: str) -> str:
    """Normalize common PostgreSQL URLs for the asyncpg SQLAlchemy driver."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


@lru_cache
def build_session_factory():
    database_url = get_settings().database_url
    if not database_url:
        return None

    engine = create_async_engine(
        _async_database_url(database_url),
        pool_pre_ping=True,
    )
    return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    factory = build_session_factory()
    if factory is None:
        raise RuntimeError("DATABASE_URL is not configured")

    async with factory() as session:
        yield session
