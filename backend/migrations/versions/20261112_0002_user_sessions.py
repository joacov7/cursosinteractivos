"""Add revocable refresh-token sessions.

Revision ID: 20261112_0002
Revises: 20261112_0001
"""

from alembic import op

revision = "20261112_0002"
down_revision = "20261112_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        last_used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """)
    op.execute("CREATE INDEX ix_user_sessions_user_expiry ON user_sessions (user_id, expires_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_sessions")
