import asyncio
import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password
from app.db.models import Course, CourseModule, Enrollment, Lesson, User
from app.db.session import _async_database_url, get_db_session
from app.main import app



@pytest.fixture
def client(monkeypatch):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        pytest.skip("DATABASE_URL is only configured in the PostgreSQL integration job")
    monkeypatch.setenv("JWT_SECRET", "course-test-secret-" + "x" * 32)
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "false")
    get_settings.cache_clear()
    engine = create_async_engine(_async_database_url(database_url), poolclass=NullPool)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_db_session():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db_session] = override_db_session
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())
        get_settings.cache_clear()


def test_catalog_hides_paid_lesson_content_until_enrollment(client: TestClient):
    database_url = os.environ["DATABASE_URL"]
    email = f"course-{uuid4().hex}@example.com"
    password = "correct-horse-battery-staple-2026"
    identifiers = {}

    async def seed():
        engine = create_async_engine(_async_database_url(database_url), poolclass=NullPool)
        factory = async_sessionmaker(engine, expire_on_commit=False)
        async with factory() as db:
            user = User(
                email=email,
                full_name="Course Student",
                password_hash=hash_password(password),
                role="student",
            )
            course = Course(
                slug=f"curso-{uuid4().hex[:10]}",
                title="Electricidad segura",
                description="Curso de prueba",
                status="published",
                price_minor=50000,
                currency="ARS",
            )
            db.add_all([user, course])
            await db.flush()
            module = CourseModule(course_id=course.id, title="Módulo 1", position=0)
            db.add(module)
            await db.flush()
            preview = Lesson(
                module_id=module.id,
                title="Introducción",
                content_type="article",
                content="Contenido público de muestra",
                is_preview=True,
                position=0,
            )
            paid = Lesson(
                module_id=module.id,
                title="Protecciones",
                content_type="article",
                content="CONTENIDO PAGADO CONFIDENCIAL",
                is_preview=False,
                position=1,
            )
            db.add_all([preview, paid])
            await db.commit()
            identifiers.update(
                user_id=user.id,
                course_id=course.id,
                slug=course.slug,
                paid_lesson_id=paid.id,
            )
        await engine.dispose()

    asyncio.run(seed())
    token = create_access_token(identifiers["user_id"], "student")
    headers = {"Authorization": f"Bearer {token}"}

    public = client.get(f"/api/v1/courses/{identifiers['slug']}")
    assert public.status_code == 200
    lessons = public.json()["modules"][0]["lessons"]
    assert lessons[0]["content"] == "Contenido público de muestra"
    assert lessons[1]["content"] is None
    assert lessons[1]["locked"] is True
    assert "CONTENIDO PAGADO CONFIDENCIAL" not in public.text

    blocked = client.put(
        f"/api/v1/lessons/{identifiers['paid_lesson_id']}/progress",
        headers=headers,
        json={"status": "completed", "progress_percent": 100},
    )
    assert blocked.status_code == 403

    async def enroll():
        engine = create_async_engine(_async_database_url(database_url), poolclass=NullPool)
        factory = async_sessionmaker(engine, expire_on_commit=False)
        async with factory() as db:
            db.add(
                Enrollment(
                    user_id=identifiers["user_id"],
                    course_id=identifiers["course_id"],
                    status="active",
                    source="purchase",
                )
            )
            await db.commit()
        await engine.dispose()

    asyncio.run(enroll())

    unlocked = client.get(f"/api/v1/courses/{identifiers['slug']}", headers=headers)
    assert unlocked.status_code == 200
    assert unlocked.json()["access_granted"] is True
    assert unlocked.json()["modules"][0]["lessons"][1]["content"] == "CONTENIDO PAGADO CONFIDENCIAL"

    progress = client.put(
        f"/api/v1/lessons/{identifiers['paid_lesson_id']}/progress",
        headers=headers,
        json={"status": "completed", "progress_percent": 70},
    )
    assert progress.status_code == 200
    assert progress.json()["status"] == "completed"
    assert progress.json()["progress_percent"] == 100

    mine = client.get("/api/v1/me/courses", headers=headers)
    assert mine.status_code == 200
    assert any(item["course"]["id"] == str(identifiers["course_id"]) for item in mine.json())


def test_seed_command_creates_course_modules_and_preview_lessons(client):
    from app.cli import seed_electricity_course
    from app.db.models import Course

    asyncio.run(seed_electricity_course())

    async def inspect_seed():
        engine = create_async_engine(_async_database_url(os.environ["DATABASE_URL"]), poolclass=NullPool)
        factory = async_sessionmaker(engine, expire_on_commit=False)
        async with factory() as db:
            course = await db.scalar(select(Course).where(Course.slug == "electricidad-desde-cero"))
            assert course is not None
            assert course.status == "published"
            assert course.price_minor == 1490000
            modules = list((await db.scalars(
                select(CourseModule).where(CourseModule.course_id == course.id)
            )).all())
            lessons = list((await db.scalars(
                select(Lesson).where(Lesson.module_id.in_([module.id for module in modules]))
            )).all())
            assert len(modules) == 4
            assert len(lessons) == 17
            assert sum(1 for lesson in lessons if lesson.is_preview) == 2
            assert any(lesson.simulator_key == "banco" for lesson in lessons)
        await engine.dispose()

    asyncio.run(inspect_seed())
    with pytest.raises(RuntimeError, match="ya existe"):
        asyncio.run(seed_electricity_course())
