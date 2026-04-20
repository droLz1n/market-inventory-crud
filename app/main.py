from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import ensure_database_schema
from app.exceptions import DatabaseUnavailableError
from app.routers.produtos import router as produtos_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        ensure_database_schema()
    except DatabaseUnavailableError as exc:
        raise RuntimeError(
            "Nao foi possivel conectar ao PostgreSQL. Verifique se o banco esta ativo e se as credenciais estao corretas."
        ) from exc
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title="Market Inventory API",
        version="1.0.0",
        description="API para integrar o frontend do estoque com o PostgreSQL.",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/")
    def root() -> dict[str, str]:
        return {
            "mensagem": "API do estoque funcionando.",
            "docs": "/docs",
        }

    application.include_router(produtos_router)
    return application


app = create_app()
