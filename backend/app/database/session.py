import os
import ssl
from sqlmodel import SQLModel
from dotenv import load_dotenv
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip('"\'')
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./database.db"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith(
    "postgresql+asyncpg://"
):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    DEFAULT_CONTEXT = ssl.create_default_context()
    DEFAULT_CONTEXT.check_hostname = False
    DEFAULT_CONTEXT.verify_mode = ssl.CERT_NONE
    connect_args = {
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0,
        "ssl": DEFAULT_CONTEXT,
    }

engine = create_async_engine(
    url=DATABASE_URL,
    echo=True,
    connect_args=connect_args,
)

session_factory = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def init_db():
    async with engine.connect() as connect:
        await connect.run_sync(SQLModel.metadata.create_all)
        await connect.commit()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session
