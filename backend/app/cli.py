"""Interactive, one-time administrator bootstrap. Run: python -m app.cli create-admin"""
import asyncio
import getpass
from datetime import datetime, timezone

from sqlalchemy import func, select, text

from app.core.security import hash_password
from app.db.models import Course, CourseModule, Lesson, User
from app.db.session import build_session_factory


async def create_admin() -> None:
    factory = build_session_factory()
    if factory is None:
        raise RuntimeError("DATABASE_URL must be configured")
    async with factory() as db:
        await db.execute(text("SELECT pg_advisory_xact_lock(734921805)"))
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
                    role="admin", email_verified_at=datetime.now(timezone.utc)))
        await db.commit()
        print("Administrador creado.")


async def seed_electricity_course(price_minor: int = 1490000) -> None:
    """Create the initial published course catalog entry and lesson map once."""
    factory = build_session_factory()
    if factory is None:
        raise RuntimeError("DATABASE_URL must be configured")
    modules = [
        ("Básico", [
            ("Ley de Ohm y potencia", "ohm-potencia", False),
            ("Cables y secciones (mm²)", "cable-termica", True),
            ("Térmicas: protección del cable", "cable-termica", True),
            ("Cortocircuito vs. sobrecarga", "corto-sobrecarga", False),
            ("Puesta a tierra", "puesta-tierra", False),
            ("Tomacorrientes y polaridad", "polaridad", False),
        ]),
        ("Intermedio", [
            ("Circuitos serie vs. paralelo", "serie-paralelo", False),
            ("Cálculo de cargas por ambiente", "cargas-ambiente", False),
            ("Disyuntor diferencial", "diferencial", False),
            ("Tablero completo", "tablero", False),
            ("Iluminación", "iluminacion", False),
        ]),
        ("Avanzado", [
            ("Trifásica", "trifasica", False),
            ("Motores: arranque", "motores-arranque", False),
            ("Arranque de compresores", "compresor-diagnostico", False),
            ("Mantenimiento industrial básico", "selectividad", False),
            ("Normativa: introducción a AEA", "normativa-aea", False),
        ]),
        ("Banco de trabajo", [
            ("Banco de pruebas interactivo", "banco", False),
        ]),
    ]
    async with factory() as db:
        course = await db.scalar(select(Course).where(Course.slug == "electricidad-desde-cero"))
        if course is not None:
            raise RuntimeError("El curso ya existe; no se sobrescribe el catálogo.")
        course = Course(
            slug="electricidad-desde-cero",
            title="Curso interactivo de Electricidad",
            description="Aprendé electricidad desde cero con simulaciones, ejercicios y un banco de trabajo interactivo.",
            status="published",
            price_minor=price_minor,
            currency="ARS",
        )
        db.add(course)
        await db.flush()
        for module_position, (module_title, lessons) in enumerate(modules):
            module = CourseModule(
                course_id=course.id,
                title=module_title,
                position=module_position,
            )
            db.add(module)
            await db.flush()
            for lesson_position, (lesson_title, simulator_key, preview) in enumerate(lessons):
                db.add(Lesson(
                    module_id=module.id,
                    title=lesson_title,
                    content_type="simulator",
                    simulator_key=simulator_key,
                    is_preview=preview,
                    position=lesson_position,
                ))
        await db.commit()
        print(f"Curso publicado: {course.slug} — precio ARS minor units: {price_minor}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) == 2 and sys.argv[1] == "create-admin":
        asyncio.run(create_admin())
    elif len(sys.argv) in (2, 4) and sys.argv[1] == "seed-electricity-course":
        price = 1490000
        if len(sys.argv) == 4 and sys.argv[2] == "--price-minor":
            price = int(sys.argv[3])
        elif len(sys.argv) != 2:
            raise SystemExit("Uso: python -m app.cli seed-electricity-course [--price-minor 1490000]")
        if price <= 0:
            raise SystemExit("El precio debe ser mayor a cero")
        asyncio.run(seed_electricity_course(price))
    else:
        raise SystemExit("Uso: python -m app.cli create-admin | seed-electricity-course [--price-minor 1490000]")
