"""Add shared PostgreSQL-backed authentication rate limits.

Revision ID: 20261112_0004
Revises: 20261112_0003
"""
from alembic import op

revision = "20261112_0004"
down_revision = "20261112_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE auth_rate_limits (
        bucket_key VARCHAR(64) PRIMARY KEY,
        attempts INTEGER NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        CONSTRAINT ck_auth_rate_limits_positive_attempts CHECK (attempts > 0)
    )
    """)
    op.execute("CREATE INDEX ix_auth_rate_limits_expires_at ON auth_rate_limits (expires_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS auth_rate_limits")
