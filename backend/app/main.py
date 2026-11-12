from fastapi import FastAPI

app = FastAPI(
    title="Interactive Courses API",
    version="0.1.0",
    description="Backend API for the interactive electricity learning platform.",
)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Liveness endpoint; does not expose infrastructure details."""
    return {"status": "ok"}
