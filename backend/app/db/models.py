from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        sa.CheckConstraint("role IN ('student', 'admin')", name="valid_role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(sa.String(320), nullable=False)
    password_hash: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(sa.String(160), nullable=False)
    role: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="student")
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.true())
    email_verified_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))


class Course(TimestampMixin, Base):
    __tablename__ = "courses"
    __table_args__ = (
        sa.CheckConstraint("status IN ('draft', 'published', 'archived')", name="valid_status"),
        sa.CheckConstraint("price_minor >= 0", name="nonnegative_price"),
        sa.CheckConstraint("currency ~ '^[A-Z]{3}$'", name="valid_currency"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(sa.String(120), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="draft")
    price_minor: Mapped[int] = mapped_column(sa.BigInteger, nullable=False, server_default="0")
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="ARS")


class CourseModule(TimestampMixin, Base):
    __tablename__ = "course_modules"
    __table_args__ = (
        sa.UniqueConstraint("course_id", "position"),
        sa.CheckConstraint("position >= 0", name="nonnegative_position"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    position: Mapped[int] = mapped_column(sa.Integer, nullable=False)


class Lesson(TimestampMixin, Base):
    __tablename__ = "lessons"
    __table_args__ = (
        sa.UniqueConstraint("module_id", "position"),
        sa.CheckConstraint("position >= 0", name="nonnegative_position"),
        sa.CheckConstraint("content_type IN ('article', 'video', 'simulator', 'quiz')", name="valid_content_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    content_type: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="article")
    content: Mapped[str | None] = mapped_column(sa.Text)
    simulator_key: Mapped[str | None] = mapped_column(sa.String(100))
    is_preview: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.false())
    position: Mapped[int] = mapped_column(sa.Integer, nullable=False)


class Enrollment(TimestampMixin, Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        sa.UniqueConstraint("user_id", "course_id"),
        sa.CheckConstraint("status IN ('active', 'expired', 'revoked')", name="valid_status"),
        sa.CheckConstraint("source IN ('purchase', 'grant', 'free')", name="valid_source"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="active")
    source: Mapped[str] = mapped_column(sa.String(20), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))


class LessonProgress(TimestampMixin, Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (
        sa.UniqueConstraint("user_id", "lesson_id"),
        sa.CheckConstraint("status IN ('not_started', 'in_progress', 'completed')", name="valid_status"),
        sa.CheckConstraint("progress_percent BETWEEN 0 AND 100", name="valid_progress"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="not_started")
    progress_percent: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="0")
    completed_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    __table_args__ = (sa.CheckConstraint("score BETWEEN 0 AND 100", name="valid_score"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    passed: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    answer_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())


class Order(TimestampMixin, Base):
    __tablename__ = "orders"
    __table_args__ = (
        sa.CheckConstraint("status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back')", name="valid_status"),
        sa.CheckConstraint("amount_minor > 0", name="positive_amount"),
        sa.CheckConstraint("currency ~ '^[A-Z]{3}$'", name="valid_currency"),
        sa.UniqueConstraint("provider", "provider_payment_id"),
        sa.UniqueConstraint("idempotency_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False)
    amount_minor: Mapped[int] = mapped_column(sa.BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="ARS")
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="pending")
    provider: Mapped[str] = mapped_column(sa.String(40), nullable=False, server_default="mercado_pago")
    provider_payment_id: Mapped[str | None] = mapped_column(sa.String(120))
    idempotency_key: Mapped[str] = mapped_column(sa.String(120), nullable=False)


class PaymentEvent(Base):
    __tablename__ = "payment_events"
    __table_args__ = (
        sa.UniqueConstraint("provider", "provider_event_id"),
        sa.CheckConstraint("status IN ('received', 'processed', 'failed', 'ignored')", name="valid_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="SET NULL"))
    provider: Mapped[str] = mapped_column(sa.String(40), nullable=False)
    provider_event_id: Mapped[str] = mapped_column(sa.String(160), nullable=False)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="received")
    payload_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    processed_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())


class Certificate(Base):
    __tablename__ = "certificates"
    __table_args__ = (
        sa.UniqueConstraint("user_id", "course_id"),
        sa.CheckConstraint("status IN ('issued', 'revoked')", name="valid_status"),
        sa.CheckConstraint("(status = 'issued' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL)", name="valid_revocation"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False)
    public_code: Mapped[str] = mapped_column(sa.String(40), nullable=False, unique=True)
    student_name_snapshot: Mapped[str] = mapped_column(sa.String(160), nullable=False)
    course_title_snapshot: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="issued")
    issued_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    revoked_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(sa.String(80), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(sa.String(80))
    metadata_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())


sa.Index("ix_users_email_lower", sa.func.lower(User.email), unique=True)
sa.Index("ix_courses_status", Course.status)
sa.Index("ix_enrollments_user_status", Enrollment.user_id, Enrollment.status)
sa.Index("ix_lesson_progress_user", LessonProgress.user_id)
sa.Index("ix_orders_user_created", Order.user_id, Order.created_at)
sa.Index("ix_payment_events_order", PaymentEvent.order_id)
sa.Index("ix_certificates_public_code", Certificate.public_code)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token_hash: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    last_used_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())


sa.Index("ix_user_sessions_user_expiry", UserSession.user_id, UserSession.expires_at)


class AuthActionToken(Base):
    __tablename__ = "auth_action_tokens"
    __table_args__ = (
        sa.CheckConstraint("purpose IN ('verify_email', 'password_reset')", name="valid_purpose"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    purpose: Mapped[str] = mapped_column(sa.String(30), nullable=False)
    token_hash: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())


sa.Index("ix_auth_action_tokens_user_purpose", AuthActionToken.user_id, AuthActionToken.purpose)


class AuthRateLimit(Base):
    __tablename__ = "auth_rate_limits"
    __table_args__ = (
        sa.CheckConstraint("attempts > 0", name="positive_attempts"),
    )

    bucket_key: Mapped[str] = mapped_column(sa.String(64), primary_key=True)
    attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)


sa.Index("ix_auth_rate_limits_expires_at", AuthRateLimit.expires_at)
