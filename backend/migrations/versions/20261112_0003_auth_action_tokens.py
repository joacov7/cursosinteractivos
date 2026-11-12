"""Add single-use email verification and password reset tokens.

Revision ID: 20261112_0003
Revises: 20261112_0002
"""
from alembic import op

revision = "20261112_0003"
down_revision = "20261112_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE auth_action_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        purpose VARCHAR(30) NOT NULL,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT ck_auth_action_tokens_purpose CHECK (purpose IN ('verify_email', 'password_reset'))
    )
    """)
    op.execute("CREATE INDEX ix_auth_action_tokens_user_purpose ON auth_action_tokens (user_id, purpose)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS auth_action_tokens")
