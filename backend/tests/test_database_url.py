from app.db.session import _async_database_url


def test_postgres_url_is_normalized_for_asyncpg():
    assert _async_database_url("postgres://u:p@host/db") == "postgresql+asyncpg://u:p@host/db"


def test_postgresql_url_is_normalized_for_asyncpg():
    assert _async_database_url("postgresql://u:p@host/db") == "postgresql+asyncpg://u:p@host/db"


def test_existing_asyncpg_url_is_unchanged():
    url = "postgresql+asyncpg://u:p@host/db"
    assert _async_database_url(url) == url
