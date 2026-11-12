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

The schema covers users, courses, modules, lessons, enrollments, lesson progress, quiz attempts, orders, payment events, certificates, administrator audit entries, refresh sessions and single-use account action tokens.

CI applies, rolls back and reapplies migrations against an ephemeral PostgreSQL 16 service.

## Authentication and account security

- `POST /api/v1/auth/register`: creates a student account; public registration cannot select an administrator role. With `REQUIRE_VERIFIED_EMAIL=true`, a verification email is sent.
- `POST /api/v1/auth/verify-email`: consumes a single-use, expiring verification token.
- `POST /api/v1/auth/resend-verification`: requests a new verification email without revealing whether an account exists.
- `POST /api/v1/auth/request-password-reset`: requests password reset instructions with a generic response.
- `POST /api/v1/auth/reset-password`: consumes a single-use token, changes the password and revokes all active refresh sessions.
- `POST /api/v1/auth/login`: validates credentials, returns a short-lived bearer access token and sets a refresh token in an HttpOnly cookie. Unverified users are rejected when email verification is required.
- `POST /api/v1/auth/refresh`: rotates the refresh token; the previous token is revoked.
- `POST /api/v1/auth/logout`: revokes the refresh session and clears its cookie.
- `GET /api/v1/auth/me`: returns the authenticated user's profile.

Passwords use Argon2id. Refresh tokens and account-action tokens are random opaque values; only SHA-256 hashes are stored in PostgreSQL. Verification and reset tokens are single-use and expire. Access tokens use HS256 and require a `JWT_SECRET` of at least 32 characters. Set `ENVIRONMENT=production` to enable the Secure cookie flag. Browser origins are restricted through `ALLOWED_ORIGINS`.

## Email delivery

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` and `FRONTEND_URL`. SMTP delivery uses STARTTLS. Without SMTP configuration, account creation still succeeds but the message cannot be delivered; configure SMTP and use the resend endpoint. Do not expose action tokens in API responses or logs.

## First administrator

There is deliberately no public administrator-registration endpoint. After applying migrations, run this command from `backend/` in a trusted terminal:

```bash
python -m app.cli create-admin
```

It prompts for the first administrator's details and password, refuses to run if an administrator already exists, and marks the account email as verified. Restrict database credentials and terminal access. Do not run this command as part of application startup or a public web request.

## Production checklist still open

- Configure and verify a real SMTP provider.
- Add distributed rate limiting for login, registration and account-action endpoints.
- Complete CSRF/origin review against the final production domains and reverse proxy.
- Add browser-based end-to-end tests and independent security review.
- Configure Neon and deployment secrets only after the owner selects/provisions the external services.

Never commit `.env` or real credentials. Keep separate databases for development, CI and production. Do not expose database credentials to the browser. Payment status and course access must only be changed by trusted backend workflows.
