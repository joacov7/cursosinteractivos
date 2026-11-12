# Backend API

Initial FastAPI service scaffold.

## Local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health endpoint: `GET /health`.

No production secrets or database credentials are committed. Database configuration and migrations will be added in the next implementation stage.
