import asyncio
import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.api.v1.routes.auth import _REFRESH_COOKIE
from app.core.config import get_settings
from app.db.session import _async_database_url, get_db_session
from app.main import app


@pytest.fixture
def client(monkeypatch):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        pytest.skip("DATABASE_URL is only configured in the PostgreSQL integration job")

    monkeypatch.setenv("JWT_SECRET", "integration-test-secret-" + "x" * 32)
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "false")
    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "false")
    get_settings.cache_clear()

    engine = create_async_engine(_async_database_url(database_url), poolclass=NullPool)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_db_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db_session] = override_db_session
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())
        get_settings.cache_clear()


def test_registration_login_refresh_rotation_and_logout(client):
    email = f"student-{uuid4().hex}@example.com"
    password = "correct-horse-battery-staple-2026"

    registered = client.post(
        "/api/v1/auth/register",
        json={"email": email.upper(), "password": password, "full_name": "Test Student", "role": "admin"},
    )
    assert registered.status_code == 201
    assert registered.json()["role"] == "student"

    duplicate = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Duplicate Student"},
    )
    assert duplicate.status_code == 409

    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    access_token = login.json()["access_token"]
    assert _REFRESH_COOKIE in login.headers["set-cookie"].lower()
    assert "httponly" in login.headers["set-cookie"].lower()

    profile = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert profile.status_code == 200
    assert profile.json()["email"] == email.lower()

    old_refresh_token = client.cookies.get(_REFRESH_COOKIE)
    refreshed = client.post("/api/v1/auth/refresh")
    assert refreshed.status_code == 200
    new_refresh_token = client.cookies.get(_REFRESH_COOKIE)
    assert new_refresh_token and new_refresh_token != old_refresh_token

    replay = client.post("/api/v1/auth/refresh", cookies={_REFRESH_COOKIE: old_refresh_token})
    assert replay.status_code == 401

    client.cookies.set(_REFRESH_COOKIE, new_refresh_token, path="/api/v1/auth")
    logout = client.post("/api/v1/auth/logout")
    assert logout.status_code == 204

    after_logout = client.post("/api/v1/auth/refresh", cookies={_REFRESH_COOKIE: new_refresh_token})
    assert after_logout.status_code == 401


def test_login_rejects_invalid_password(client):
    email = f"student-{uuid4().hex}@example.com"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "correct-horse-battery-staple-2026", "full_name": "Test Student"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "incorrect-password"},
    )
    assert response.status_code == 401


def test_email_verification_is_required_and_single_use(client, monkeypatch):
    import app.api.v1.routes.auth as auth_routes

    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "true")
    get_settings.cache_clear()
    delivered = {}

    async def capture_email(email, purpose, token):
        delivered.update(email=email, purpose=purpose, token=token)

    monkeypatch.setattr(auth_routes, "send_action_email", capture_email)
    email = f"verify-{uuid4().hex}@example.com"
    password = "correct-horse-battery-staple-2026"
    registered = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Verify Student"},
    )
    assert registered.status_code == 201
    assert delivered["purpose"] == "verify_email"

    blocked = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert blocked.status_code == 403

    verified = client.post("/api/v1/auth/verify-email", json={"token": delivered["token"]})
    assert verified.status_code == 200
    assert client.post("/api/v1/auth/verify-email", json={"token": delivered["token"]}).status_code == 400
    assert client.post("/api/v1/auth/login", json={"email": email, "password": password}).status_code == 200
    get_settings.cache_clear()


def test_password_reset_revokes_existing_sessions(client, monkeypatch):
    import app.api.v1.routes.auth as auth_routes

    delivered = {}

    async def capture_email(email, purpose, token):
        delivered.update(email=email, purpose=purpose, token=token)

    monkeypatch.setattr(auth_routes, "send_action_email", capture_email)
    email = f"reset-{uuid4().hex}@example.com"
    old_password = "correct-horse-battery-staple-2026"
    new_password = "new-correct-horse-battery-2027"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": old_password, "full_name": "Reset Student"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": old_password})
    assert login.status_code == 200

    requested = client.post("/api/v1/auth/request-password-reset", json={"email": email})
    assert requested.status_code == 202
    assert delivered["purpose"] == "password_reset"
    changed = client.post(
        "/api/v1/auth/reset-password",
        json={"token": delivered["token"], "new_password": new_password},
    )
    assert changed.status_code == 200
    assert client.post("/api/v1/auth/refresh").status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": email, "password": old_password}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": email, "password": new_password}).status_code == 200


def test_email_verification_is_required_and_single_use(client, monkeypatch):
    import app.api.v1.routes.auth as auth_routes

    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "true")
    get_settings.cache_clear()
    delivered = {}

    async def capture_email(email, purpose, token):
        delivered.update(email=email, purpose=purpose, token=token)

    monkeypatch.setattr(auth_routes, "send_action_email", capture_email)
    email = f"verify-{uuid4().hex}@example.com"
    password = "correct-horse-battery-staple-2026"
    registered = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Verify Student"},
    )
    assert registered.status_code == 201
    assert delivered["purpose"] == "verify_email"

    blocked = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert blocked.status_code == 403

    verified = client.post("/api/v1/auth/verify-email", json={"token": delivered["token"]})
    assert verified.status_code == 200
    assert client.post("/api/v1/auth/verify-email", json={"token": delivered["token"]}).status_code == 400
    assert client.post("/api/v1/auth/login", json={"email": email, "password": password}).status_code == 200
    get_settings.cache_clear()


def test_password_reset_revokes_existing_sessions(client, monkeypatch):
    import app.api.v1.routes.auth as auth_routes

    delivered = {}

    async def capture_email(email, purpose, token):
        delivered.update(email=email, purpose=purpose, token=token)

    monkeypatch.setattr(auth_routes, "send_action_email", capture_email)
    email = f"reset-{uuid4().hex}@example.com"
    old_password = "correct-horse-battery-staple-2026"
    new_password = "new-correct-horse-battery-2027"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": old_password, "full_name": "Reset Student"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": old_password})
    assert login.status_code == 200

    requested = client.post("/api/v1/auth/request-password-reset", json={"email": email})
    assert requested.status_code == 202
    assert delivered["purpose"] == "password_reset"
    changed = client.post(
        "/api/v1/auth/reset-password",
        json={"token": delivered["token"], "new_password": new_password},
    )
    assert changed.status_code == 200
    assert client.post("/api/v1/auth/refresh").status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": email, "password": old_password}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": email, "password": new_password}).status_code == 200
