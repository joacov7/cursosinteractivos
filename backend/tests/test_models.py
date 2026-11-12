from app.db.base import Base
from app.db import models  # noqa: F401


def test_initial_platform_tables_are_registered():
    expected = {
        "users",
        "user_sessions",
        "courses",
        "course_modules",
        "lessons",
        "enrollments",
        "lesson_progress",
        "quiz_attempts",
        "orders",
        "payment_events",
        "certificates",
        "admin_audit_log",
    }

    assert expected.issubset(Base.metadata.tables)


def test_payment_events_have_provider_idempotency_constraint():
    table = Base.metadata.tables["payment_events"]
    unique_columns = {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if constraint.__class__.__name__ == "UniqueConstraint"
    }

    assert ("provider", "provider_event_id") in unique_columns


def test_users_have_case_insensitive_email_unique_index():
    table = Base.metadata.tables["users"]
    assert any(index.unique and index.name == "ix_users_email_lower" for index in table.indexes)
