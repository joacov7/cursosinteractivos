from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_optional_current_user
from app.db.models import Course, CourseModule, Enrollment, Lesson, LessonProgress, User
from app.db.session import get_db_session
from app.schemas.courses import (
    CourseDetail,
    CourseSummary,
    LessonSummary,
    ModuleSummary,
    ProgressResponse,
    ProgressUpdate,
    StudentCourse,
)

router = APIRouter(tags=["courses"])


async def _has_course_access(
    course: Course, user: User | None, db: AsyncSession
) -> bool:
    if course.price_minor == 0:
        return True
    if user is None:
        return False
    now = datetime.now(timezone.utc)
    enrollment = await db.scalar(
        select(Enrollment.id).where(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course.id,
            Enrollment.status == "active",
            or_(Enrollment.expires_at.is_(None), Enrollment.expires_at > now),
        )
    )
    return enrollment is not None


@router.get("/courses", response_model=list[CourseSummary])
async def list_courses(
    offset: int = Query(default=0, ge=0, le=10000),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
) -> list[Course]:
    result = await db.scalars(
        select(Course)
        .where(Course.status == "published")
        .order_by(Course.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.all())


@router.get("/courses/{slug}", response_model=CourseDetail)
async def get_course(
    slug: str,
    user: User | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CourseDetail:
    course = await db.scalar(
        select(Course).where(Course.slug == slug, Course.status == "published")
    )
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    access = await _has_course_access(course, user, db)
    modules = list(
        (
            await db.scalars(
                select(CourseModule)
                .where(CourseModule.course_id == course.id)
                .order_by(CourseModule.position)
            )
        ).all()
    )
    lessons_by_module: dict[UUID, list[Lesson]] = {module.id: [] for module in modules}
    if modules:
        lessons = (
            await db.scalars(
                select(Lesson)
                .where(Lesson.module_id.in_([module.id for module in modules]))
                .order_by(Lesson.position)
            )
        ).all()
        for lesson in lessons:
            lessons_by_module[lesson.module_id].append(lesson)

    module_data = []
    for module in modules:
        lesson_data = [
            LessonSummary(
                id=lesson.id,
                title=lesson.title,
                content_type=lesson.content_type,
                simulator_key=lesson.simulator_key,
                is_preview=lesson.is_preview,
                position=lesson.position,
                content=lesson.content if access or lesson.is_preview else None,
                locked=not (access or lesson.is_preview),
            )
            for lesson in lessons_by_module[module.id]
        ]
        module_data.append(
            ModuleSummary(
                id=module.id,
                title=module.title,
                position=module.position,
                lessons=lesson_data,
            )
        )

    return CourseDetail(
        id=course.id,
        slug=course.slug,
        title=course.title,
        description=course.description,
        price_minor=course.price_minor,
        currency=course.currency,
        modules=module_data,
        access_granted=access,
    )


@router.get("/me/courses", response_model=list[StudentCourse])
async def my_courses(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[StudentCourse]:
    now = datetime.now(timezone.utc)
    rows = (
        await db.execute(
            select(Course, Enrollment)
            .outerjoin(
                Enrollment,
                and_(
                    Enrollment.course_id == Course.id,
                    Enrollment.user_id == user.id,
                    Enrollment.status == "active",
                    or_(Enrollment.expires_at.is_(None), Enrollment.expires_at > now),
                ),
            )
            .where(
                Course.status == "published",
                or_(Course.price_minor == 0, Enrollment.id.is_not(None)),
            )
            .order_by(Course.title)
        )
    ).all()
    return [
        StudentCourse(
            course=CourseSummary.model_validate(course),
            access_granted=True,
            enrollment_source=enrollment.source if enrollment else "free",
            expires_at=enrollment.expires_at if enrollment else None,
        )
        for course, enrollment in rows
    ]


@router.put("/lessons/{lesson_id}/progress", response_model=ProgressResponse)
async def update_lesson_progress(
    lesson_id: UUID,
    payload: ProgressUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ProgressResponse:
    row = await db.execute(
        select(Lesson, Course)
        .join(CourseModule, Lesson.module_id == CourseModule.id)
        .join(Course, CourseModule.course_id == Course.id)
        .where(Lesson.id == lesson_id, Course.status == "published")
    )
    lesson_course = row.first()
    if lesson_course is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    _, course = lesson_course
    if not await _has_course_access(course, user, db):
        raise HTTPException(status_code=403, detail="Course access required")

    now = datetime.now(timezone.utc)
    percent = 100 if payload.status == "completed" else (
        0 if payload.status == "not_started" else payload.progress_percent
    )
    completed_at = now if payload.status == "completed" else None
    statement = (
        pg_insert(LessonProgress)
        .values(
            user_id=user.id,
            lesson_id=lesson_id,
            status=payload.status,
            progress_percent=percent,
            completed_at=completed_at,
        )
        .on_conflict_do_update(
            index_elements=[LessonProgress.user_id, LessonProgress.lesson_id],
            set_={
                "status": payload.status,
                "progress_percent": percent,
                "completed_at": completed_at,
                "updated_at": now,
            },
        )
        .returning(LessonProgress)
    )
    result = await db.execute(statement)
    await db.commit()
    progress = result.scalar_one()
    return ProgressResponse(
        lesson_id=progress.lesson_id,
        status=progress.status,
        progress_percent=progress.progress_percent,
        completed_at=progress.completed_at,
    )
