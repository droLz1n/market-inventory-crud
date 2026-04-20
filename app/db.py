from __future__ import annotations

import os
from contextlib import closing
from dataclasses import asdict, dataclass
from functools import lru_cache

import psycopg2
from psycopg2.extensions import connection as PgConnection

from app.exceptions import DatabaseUnavailableError


@dataclass(frozen=True, slots=True)
class DatabaseConfig:
    dbname: str
    user: str
    password: str
    host: str
    port: str


def load_database_config() -> DatabaseConfig:
    return DatabaseConfig(
        dbname=os.getenv("DB_NAME", "market_inventory"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "9999"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )


def create_connection() -> PgConnection:
    try:
        return psycopg2.connect(**asdict(load_database_config()))
    except psycopg2.Error as exc:
        raise DatabaseUnavailableError(
            "Nao foi possivel conectar ao PostgreSQL. Verifique se o servidor do banco esta ligado."
        ) from exc


def ensure_database_schema() -> None:
    with closing(create_connection()) as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS produtos (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(120) NOT NULL,
                    tamanho VARCHAR(20) NOT NULL,
                    quantidade NUMERIC(10, 2) NOT NULL,
                    preco NUMERIC(10, 2) NOT NULL,
                    tipo VARCHAR(20) NOT NULL
                );
                """
            )
            cursor.execute(
                """
                ALTER TABLE produtos
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ativo';
                """
            )
            cursor.execute(
                """
                ALTER TABLE produtos
                ADD COLUMN IF NOT EXISTS ultima_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE;
                """
            )
        conn.commit()


@lru_cache(maxsize=1)
def get_status_column_type() -> str:
    with closing(create_connection()) as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_name = 'produtos' AND column_name = 'status'
                """
            )
            result = cursor.fetchone()

    return result[0] if result else "character varying"
