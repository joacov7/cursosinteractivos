import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.mailer import send_action_email
from app.core.security import (
    create_access_token,
    hash_action_token,
    hash_password,
    hash_refresh_token,
    new_action_token,
    new_refresh_token,
    verify_password,
)
from app.db.models import AuthActionToken, User, UserSession
from app.db.session import get_db_session
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])
_REFRESH_COOKIE = "refresh_token"


class ActionTokenRequest(BaseModel):
    token: str = Field(min_length=32, max_length=256)


class EmailRequest(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    token: str = Field(min_length=32, max_length=256)
    new_password: str = Field(min_length=12, max_length=128)


def _set_refresh_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        path="/api/v1/auth",
    )


def _validate_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin not in get_settings().allowed_origins:
        raise HTTPException(status_code=403, detail="Origin not allowed")


def _issue_session(user: User, db: AsyncSession, response: Response) -> TokenResponse:
    refresh_token = new_refresh_token()
    settings = get_settings()
    now = datetime.now(timezone.utc)
    db.add(
        UserSession(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(refresh_token),
            expires_at=now + timedelta(days=settings.refresh_token_days),
        )
    )
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        user=UserResponse.model_validate(user),
    )


async def _create_action_token(
    user: User, purpose: str, db: AsyncSession, lifetime_minutes: int
) -> str:
    now = datetime.now(timezone.utc)
    await db.execute(
        update(AuthActionToken)
        .where(
            AuthActionToken.user_id == user.id,
            AuthActionToken.purpose == purpose,
            AuthActionToken.used_at.is_(None),
        )
        .values(used_at=now)
    )
    raw_token = new_action_token()
    db.add(
        AuthActionToken(
            user_id=user.id,
            purpose=purpose,
            token_hash=hash_action_token(raw_token),
            expires_at=now + timedelta(minutes=lifetime_minutes),
        )
    )
    await db.commit()
    return raw_token


async def _deliver_action(user: User, purpose: str, raw_token: str) -> None:
    try:
        await send_action_email(user.email, purpose, raw_token)
    except Exception:
        # Never log the token or email body. Delivery is retriable via resend/reset.
        logger.exception("Account security email delivery failed")


async def _consume_action_token(
    raw_token: str, purpose: str, db: AsyncSession
) -> tuple[AuthActionToken, User]:
    now = datetime.now(timezone.utc)
    action = await db.scalar(
        select(AuthActionToken)
        .where(
            AuthActionToken.token_hash == hash_action_token(raw_token),
            AuthActionToken.purpose == purpose,
        )
        .with_for_update()
    )
    if action is None or action.used_at is not None or action.expires_at <= now:
        raise HTTPException(status_code=400, detail="The link is invalid or has expired")
    user = await db.scalar(select(User).where(User.id == action.user_id).with_for_update())
    if user is None or not user.is_active:
        raise HTTPException(status_code=400, detail="The link is invalid or has expired")
    action.used_at = now
    return action, user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> UserResponse:
    _validate_origin(request)
    email = payload.email.strip().lower()
    existing = await db.scalar(select(User.id).where(func.lower(User.email) == email))
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="student",
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    if get_settings().require_verified_email:
        token = await _create_action_token(
            user, "verify_email", db, get_settings().email_verification_minutes
        )
        await _deliver_action(user, "verify_email", token)
    return UserResponse.model_validate(user)


@router.post("/verify-email")
async def verify_email(
    payload: ActionTokenRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    _, user = await _consume_action_token(payload.token, "verify_email", db)
    user.email_verified_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "verified"}


@router.post("/resend-verification", status_code=status.HTTP_202_ACCEPTED)
async def resend_verification(
    payload: EmailRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    email = payload.email.strip().lower()
    user = await db.scalar(select(User).where(func.lower(User.email) == email))
    if user and user.is_active and user.email_verified_at is None:
        token = await _create_action_token(
            user, "verify_email", db, get_settings().email_verification_minutes
        )
        await _deliver_action(user, "verify_email", token)
    return {"status": "If the account needs verification, an email will be sent."}


@router.post("/request-password-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    payload: EmailRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    email = payload.email.strip().lower()
    user = await db.scalar(select(User).where(func.lower(User.email) == email))
    if user and user.is_active:
        token = await _create_action_token(
            user, "password_reset", db, get_settings().password_reset_minutes
        )
        await _deliver_action(user, "password_reset", token)
    return {"status": "If the account exists, reset instructions will be sent."}


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    _, user = await _consume_action_token(payload.token, "password_reset", db)
    user.password_hash = hash_password(payload.new_password)
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user.id, UserSession.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"status": "password_updated"}


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    _validate_origin(request)
    email = payload.email.strip().lower()
    user = await db.scalar(select(User).where(func.lower(User.email) == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    if get_settings().require_verified_email and user.email_verified_at is None:
        raise HTTPException(status_code=403, detail="Email verification required")

    result = _issue_session(user, db, response)
    await db.commit()
    return result


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    _validate_origin(request)
    raw_token = request.cookies.get(_REFRESH_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Refresh session is missing")

    now = datetime.now(timezone.utc)
    session = await db.scalar(
        select(UserSession).where(UserSession.refresh_token_hash == hash_refresh_token(raw_token)).with_for_update()
    )
    if session is None or session.revoked_at is not None or session.expires_at <= now:
        response.delete_cookie(_REFRESH_COOKIE, path="/api/v1/auth")
        raise HTTPException(status_code=401, detail="Refresh session is invalid or expired")

    user = await db.scalar(select(User).where(User.id == session.user_id))
    if user is None or not user.is_active:
        session.revoked_at = now
        await db.commit()
        response.delete_cookie(_REFRESH_COOKIE, path="/api/v1/auth")
        raise HTTPException(status_code=401, detail="Account is unavailable")

    session.revoked_at = now
    session.last_used_at = now
    result = _issue_session(user, db, response)
    await db.commit()
    return result


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> Response:
    _validate_origin(request)
    raw_token = request.cookies.get(_REFRESH_COOKIE)
    if raw_token:
        session = await db.scalar(
            select(UserSession).where(UserSession.refresh_token_hash == hash_refresh_token(raw_token))
        )
        if session is not None and session.revoked_at is None:
            session.revoked_at = datetime.now(timezone.utc)
            await db.commit()

    response.delete_cookie(_REFRESH_COOKIE, path="/api/v1/auth")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)
