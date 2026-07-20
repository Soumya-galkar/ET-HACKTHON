"""Industrial Knowledge Intelligence Platform — FastAPI entrypoint."""
import os
import logging
from pathlib import Path

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("ikip")

# Mongo
mongo_url = os.environ["MONGO_URL"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ["DB_NAME"]]

app = FastAPI(title="IKIP — Industrial Knowledge Intelligence Platform")
app.state.db = db

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers.auth import router as auth_router
from routers.documents import router as documents_router
from routers.search import router as search_router
from routers.chat import router as chat_router
from routers.graph import router as graph_router
from routers.dashboard import router as dashboard_router
from routers.maintenance import router as maintenance_router
from routers.work_orders import router as work_orders_router

api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"service": "IKIP", "status": "ok"}


@api.get("/health")
async def health():
    return {"ok": True}


api.include_router(auth_router)
api.include_router(documents_router)
api.include_router(search_router)
api.include_router(chat_router)
api.include_router(graph_router)
api.include_router(dashboard_router)
api.include_router(maintenance_router)
api.include_router(work_orders_router)

app.include_router(api)


@app.on_event("startup")
async def _startup():
    # ensure indexes
    await db.users.create_index("email", unique=True)
    await db.documents.create_index([("user_id", 1), ("created_at", -1)])
    await db.chunks.create_index([("user_id", 1), ("document_id", 1)])
    await db.entities.create_index([("user_id", 1), ("label", 1)])
    await db.relationships.create_index([("user_id", 1)])
    await db.chat_messages.create_index([("user_id", 1), ("session_id", 1), ("created_at", 1)])
    await db.work_orders.create_index([("user_id", 1), ("created_at", -1)])
    await db.maintenance_reports.create_index([("user_id", 1), ("created_at", -1)])
    logger.info("IKIP startup complete")


@app.on_event("shutdown")
async def _shutdown():
    mongo_client.close()
