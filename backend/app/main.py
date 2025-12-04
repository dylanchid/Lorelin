from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .api import vob, health
from .api.v1.endpoints import async_vob
from .models import sql
from sqlmodel import SQLModel, create_engine
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lorelin VoB API")

from .core.db import engine, create_db_and_tables

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

@app.get("/")
def read_root():
    return {"message": "Lorelin VoB API is running"}

app.include_router(vob.router, prefix="/v1/vob", tags=["vob"])
app.include_router(async_vob.router, prefix="/v1/vob", tags=["async_vob"])
app.include_router(health.router, tags=["health"])
