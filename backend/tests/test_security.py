from types import SimpleNamespace
from uuid import uuid4

import jwt
import pytest

from app.core import security


def test_password_hash_is_not_plaintext_and_verifies():
    raw = "a-long-strong-test-password"
    hashed = security.hash_password(raw)

    assert hashed != raw
    assert security.verify_password(raw, hashed)
    assert not security.verify_password("wrong-password", hashed)


def test_access_token_contains_expected_claims(monkeypatch):
    monkeypatch.setattr(
        security,
        "get_settings",
        lambda: SimpleNamespace(jwt_secret="x" * 48, access_token_minutes=15),
    )
    user_id = uuid4()

    token = security.create_access_token(user_id, "student")
    claims = security.decode_access_token(token)

    assert claims["sub"] == str(user_id)
    assert claims["role"] == "student"
    assert claims["typ"] == "access"
    assert claims["iss"] == "interactive-courses-api"


def test_access_token_rejects_wrong_signature(monkeypatch):
    monkeypatch.setattr(
        security,
        "get_settings",
        lambda: SimpleNamespace(jwt_secret="x" * 48, access_token_minutes=15),
    )
    token = security.create_access_token(uuid4(), "student")

    with pytest.raises(jwt.InvalidTokenError):
        jwt.decode(token, "y" * 48, algorithms=["HS256"], issuer="interactive-courses-api")


def test_jwt_secret_must_be_at_least_32_characters(monkeypatch):
    monkeypatch.setattr(
        security,
        "get_settings",
        lambda: SimpleNamespace(jwt_secret="too-short", access_token_minutes=15),
    )

    with pytest.raises(RuntimeError, match="at least 32"):
        security.create_access_token(uuid4(), "student")


def test_refresh_tokens_are_random_and_only_hashes_are_stored():
    first = security.new_refresh_token()
    second = security.new_refresh_token()

    assert first != second
    assert len(security.hash_refresh_token(first)) == 64
    assert security.hash_refresh_token(first) != first
