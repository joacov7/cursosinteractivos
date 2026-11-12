# Backend API

FastAPI service for the interactive electricity learning platform.

## Local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Configure DATABASE_URL with a local PostgreSQL or Neon development database.
uvicorn app.main:app --reload
```

Health endpoint: `GET /health`.

## Database and migrations

The application uses SQLAlchemy 2 async sessions and Alembic migrations.

```bash
# From the backend directory, with DATABASE_URL set:
alembic upgrade head
alembic current
alembic downgrade -1
```

The initial migration creates the core entities: users, courses, modules, lessons, enrollments, lesson progress, quiz attempts, orders, payment events, certificates and administrator audit entries.

For local isolated development, a PostgreSQL 16 container can be used. CI applies, rolls back and reapplies migrations against an ephemeral PostgreSQL 16 service.

## Important security notes

- Never commit `.env` or real credentials.
- Use a separate database for development, CI and production.
- Do not expose the database connection string to the browser.
- Payment status and course access must only be changed by trusted backend workflows.
- `payload_summary` and `metadata_summary` must contain sanitized data, not secrets or card information.
- The initial schema is a foundation; authentication, authorization and API endpoints are not implemented yet.
