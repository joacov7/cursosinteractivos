"""Initial learning platform schema.

Revision ID: 20261112_0001
Revises:
"""

from alembic import op

revision = "20261112_0001"
down_revision = None
branch_labels = None
depends_on = None


def _execute_sql_batch(sql: str) -> None:
    connection = op.get_bind()
    for statement in sql.split(";"):
        if statement.strip():
            connection.exec_driver_sql(statement)


def upgrade() -> None:
    _execute_sql_batch("""
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(320) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(160) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        email_verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT ck_users_valid_role CHECK (role IN ('student', 'admin'))
    );
    CREATE UNIQUE INDEX ix_users_email_lower ON users (lower(email));

    CREATE TABLE courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(120) NOT NULL UNIQUE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        price_minor BIGINT NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT ck_courses_valid_status CHECK (status IN ('draft', 'published', 'archived')),
        CONSTRAINT ck_courses_nonnegative_price CHECK (price_minor >= 0),
        CONSTRAINT ck_courses_valid_currency CHECK (currency ~ '^[A-Z]{3}$')
    );
    CREATE INDEX ix_courses_status ON courses (status);

    CREATE TABLE course_modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        position INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_course_modules_course_id UNIQUE (course_id, position),
        CONSTRAINT ck_course_modules_nonnegative_position CHECK (position >= 0)
    );

    CREATE TABLE lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content_type VARCHAR(20) NOT NULL DEFAULT 'article',
        content TEXT,
        simulator_key VARCHAR(100),
        is_preview BOOLEAN NOT NULL DEFAULT FALSE,
        position INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_lessons_module_id UNIQUE (module_id, position),
        CONSTRAINT ck_lessons_nonnegative_position CHECK (position >= 0),
        CONSTRAINT ck_lessons_valid_content_type CHECK (content_type IN ('article', 'video', 'simulator', 'quiz'))
    );

    CREATE TABLE enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        source VARCHAR(20) NOT NULL,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_enrollments_user_id UNIQUE (user_id, course_id),
        CONSTRAINT ck_enrollments_valid_status CHECK (status IN ('active', 'expired', 'revoked')),
        CONSTRAINT ck_enrollments_valid_source CHECK (source IN ('purchase', 'grant', 'free'))
    );
    CREATE INDEX ix_enrollments_user_status ON enrollments (user_id, status);

    CREATE TABLE lesson_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'not_started',
        progress_percent INTEGER NOT NULL DEFAULT 0,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_lesson_progress_user_id UNIQUE (user_id, lesson_id),
        CONSTRAINT ck_lesson_progress_valid_status CHECK (status IN ('not_started', 'in_progress', 'completed')),
        CONSTRAINT ck_lesson_progress_valid_progress CHECK (progress_percent BETWEEN 0 AND 100)
    );
    CREATE INDEX ix_lesson_progress_user ON lesson_progress (user_id);

    CREATE TABLE quiz_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        answer_summary JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT ck_quiz_attempts_valid_score CHECK (score BETWEEN 0 AND 100)
    );

    CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
        amount_minor BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        provider VARCHAR(40) NOT NULL DEFAULT 'mercado_pago',
        provider_payment_id VARCHAR(120),
        idempotency_key VARCHAR(120) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_orders_provider UNIQUE (provider, provider_payment_id),
        CONSTRAINT ck_orders_valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back')),
        CONSTRAINT ck_orders_positive_amount CHECK (amount_minor > 0),
        CONSTRAINT ck_orders_valid_currency CHECK (currency ~ '^[A-Z]{3}$')
    );
    CREATE INDEX ix_orders_user_created ON orders (user_id, created_at);

    CREATE TABLE payment_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        provider VARCHAR(40) NOT NULL,
        provider_event_id VARCHAR(160) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'received',
        payload_summary JSONB,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_payment_events_provider UNIQUE (provider, provider_event_id),
        CONSTRAINT ck_payment_events_valid_status CHECK (status IN ('received', 'processed', 'failed', 'ignored'))
    );
    CREATE INDEX ix_payment_events_order ON payment_events (order_id);

    CREATE TABLE certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
        public_code VARCHAR(40) NOT NULL UNIQUE,
        student_name_snapshot VARCHAR(160) NOT NULL,
        course_title_snapshot VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'issued',
        issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        revoked_at TIMESTAMPTZ,
        CONSTRAINT uq_certificates_user_id UNIQUE (user_id, course_id),
        CONSTRAINT ck_certificates_valid_status CHECK (status IN ('issued', 'revoked')),
        CONSTRAINT ck_certificates_valid_revocation CHECK ((status = 'issued' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL))
    );
    CREATE INDEX ix_certificates_public_code ON certificates (public_code);

    CREATE TABLE admin_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(80) NOT NULL,
        resource_id VARCHAR(80),
        metadata_summary JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)


def downgrade() -> None:
    _execute_sql_batch("""
    DROP TABLE IF EXISTS admin_audit_log;
    DROP TABLE IF EXISTS certificates;
    DROP TABLE IF EXISTS payment_events;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS quiz_attempts;
    DROP TABLE IF EXISTS lesson_progress;
    DROP TABLE IF EXISTS enrollments;
    DROP TABLE IF EXISTS lessons;
    DROP TABLE IF EXISTS course_modules;
    DROP TABLE IF EXISTS courses;
    DROP TABLE IF EXISTS users;
    """)
