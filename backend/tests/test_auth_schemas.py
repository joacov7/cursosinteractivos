import pytest
from pydantic import ValidationError

from app.schemas.auth import RegisterRequest


def test_registration_requires_a_long_password():
    with pytest.raises(ValidationError):
        RegisterRequest(email="student@example.com", password="short", full_name="Student")


def test_registration_does_not_accept_a_client_selected_role():
    payload = RegisterRequest(
        email=" Student@Example.com ",
        password="long-enough-password",
        full_name="Student",
        role="admin",
    )

    assert not hasattr(payload, "role")
