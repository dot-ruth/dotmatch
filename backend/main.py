import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.jobs import router as jobs_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEFAULT_CORS_ORIGINS = ("http://localhost:3000", "http://127.0.0.1:3000")


def cors_origins() -> list[str]:
    """Browser origins allowed to call the API. Override with DOTMATCH_CORS_ORIGINS (comma separated, or *)."""
    configured = os.environ.get("DOTMATCH_CORS_ORIGINS", "").strip()
    if configured == "*":
        return ["*"]
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return list(DEFAULT_CORS_ORIGINS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting DotMatch backend")
    logger.info("CORS origins: %s", ", ".join(cors_origins()))
    yield


app = FastAPI(
    title="DotMatch",
    version="1.0.0",
    description="Remote software engineering jobs aggregated from multiple sources",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
