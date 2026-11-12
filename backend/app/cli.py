"""Interactive, one-time administrator bootstrap. Run: python -m app.cli create-admin"""
import asyncio
import getpass

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.models import User
from app.db.session import build_session_factory


async def create_admin() -> None:
    factory = build_session_factory()
    if factory is None:
        raise RuntimeError("DATABASE_URL must be configured")
    async with factory() as db:
        count = await db.scalar(select(func.count()).select_from(User).where(User.role == "admin"))
        if count:
            raise RuntimeError("An administrator already exists; bootstrap is disabled")
        email = input("Email del administrador: ").strip().lower()
        full_name = input("Nombre completo: ").strip()
        password = getpass.getpass("Contraseña (mínimo 12 caracteres): ")
        confirmation = getpass.getpass("Repetir contraseña: ")
        if not email or len(full_name) < 2 or len(password) < 12 or password != confirmation:
            raise ValueError("Datos inválidos o contraseñas distintas")
        existing = await db.scalar(select(User.id).where(func.lower(User.email) == email))
        if existing:
            raise RuntimeError("Ya existe una cuenta con ese correo")
        db.add(User(email=email, full_name=full_name, password_hash=hash_password(password),
                    role="admin", email_verified_at=__import__("datetime").datetime.now(__import__("datetime").timezone.utc)))
        await db.commit()
        print("Administrador creado.")


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2 or sys.argv[1] != "create-admin":
        raise SystemExit("Uso: python -m app.cli create-admin")
    asyncio.run(create_admin())
