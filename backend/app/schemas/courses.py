from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CourseSummary(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str | None
    price_minor: int
    currency: str
    model_config = ConfigDict(from_attributes=True)


class LessonSummary(BaseModel):
    id: UUID
    title: str
    content_type: str
    simulator_key: str | None
    is_preview: bool
    position: int
    content: str | None
    locked: bool


class ModuleSummary(BaseModel):
    id: UUID
    title: str
    position: int
    lessons: list[LessonSummary]


class CourseDetail(CourseSummary):
    modules: list[ModuleSummary]
    access_granted: bool


class ProgressUpdate(BaseModel):
    status: Literal["not_started", "in_progress", "completed"]
    progress_percent: int = Field(ge=0, le=100)


class ProgressResponse(BaseModel):
    lesson_id: UUID
    status: str
    progress_percent: int
    completed_at: datetime | None


class StudentCourse(BaseModel):
    course: CourseSummary
    access_granted: bool
    enrollment_source: str | None
    expires_at: datetime | None
