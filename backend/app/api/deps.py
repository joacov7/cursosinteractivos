from uuid import UUID

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import get_db_session

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    unauthorized = HTTPException(
        status_code=401,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except (jwt.InvalidTokenError, ValueError, KeyError):
        raise unauthorized

    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None or not user.is_active:
        raise unauthorized
    return user


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db_session),
) -> User | None:
    """Return an authenticated user when a valid bearer token is supplied; otherwise public."""
    if credentials is None:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except (jwt.InvalidTokenError, ValueError, KeyError):
        return None
    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None or not user.is_active:
        return None
    return user
