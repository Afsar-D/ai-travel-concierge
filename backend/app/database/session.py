import os
import ssl
from sqlmodel import SQLModel
from dotenv import load_dotenv
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DEFAULT_CONTEXT = ssl.create_default_context()
DEFAULT_CONTEXT.check_hostname = False
DEFAULT_CONTEXT.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    url=DATABASE_URL,  # type: ignore
    echo=True,
    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0,
        "ssl": DEFAULT_CONTEXT,
    },
)

session_factory = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def init_db():
    async with engine.begin() as connect:
        await connect.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session
