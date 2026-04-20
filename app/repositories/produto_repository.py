from __future__ import annotations

from contextlib import closing
from typing import Any

from psycopg2.extras import RealDictCursor

from app.db import create_connection, get_status_column_type
from app.domain import Produto


class ProdutoRepository:
    def list_all(self) -> list[Produto]:
        with closing(create_connection()) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    SELECT id, nome, tamanho, quantidade, preco, tipo, status, ultima_atualizacao
                    FROM produtos
                    ORDER BY id
                    """
                )
                rows = cursor.fetchall()

        return [self._to_domain(dict(row)) for row in rows]

    def get_by_id(self, codigo: int) -> Produto | None:
        with closing(create_connection()) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    SELECT id, nome, tamanho, quantidade, preco, tipo, status, ultima_atualizacao
                    FROM produtos
                    WHERE id = %s
                    """,
                    (codigo,),
                )
                row = cursor.fetchone()

        if not row:
            return None

        return self._to_domain(dict(row))

    def create(
        self,
        *,
        nome: str,
        tamanho: str,
        quantidade: float | int,
        preco: float,
        tipo: str,
        status: bool | str,
    ) -> Produto:
        with closing(create_connection()) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    INSERT INTO produtos (nome, tamanho, quantidade, preco, tipo, status, ultima_atualizacao)
                    VALUES (%s, %s, %s, %s, %s, %s, CURRENT_DATE)
                    RETURNING id, nome, tamanho, quantidade, preco, tipo, status, ultima_atualizacao
                    """,
                    (nome, tamanho, quantidade, preco, tipo, status),
                )
                row = cursor.fetchone()
            conn.commit()

        return self._to_domain(dict(row))

    def update(self, codigo: int, changes: dict[str, Any]) -> Produto | None:
        if not changes:
            return self.get_by_id(codigo)

        assignments = ", ".join(f"{column} = %s" for column in changes)
        values = list(changes.values()) + [codigo]

        with closing(create_connection()) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    f"""
                    UPDATE produtos
                    SET {assignments}, ultima_atualizacao = CURRENT_DATE
                    WHERE id = %s
                    RETURNING id, nome, tamanho, quantidade, preco, tipo, status, ultima_atualizacao
                    """,
                    tuple(values),
                )
                row = cursor.fetchone()
            conn.commit()

        if not row:
            return None

        return self._to_domain(dict(row))

    def delete(self, codigo: int) -> Produto | None:
        with closing(create_connection()) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    DELETE FROM produtos
                    WHERE id = %s
                    RETURNING id, nome, tamanho, quantidade, preco, tipo, status, ultima_atualizacao
                    """,
                    (codigo,),
                )
                row = cursor.fetchone()
            conn.commit()

        if not row:
            return None

        return self._to_domain(dict(row))

    def get_status_column_type(self) -> str:
        return get_status_column_type()

    @staticmethod
    def _to_domain(row: dict[str, Any]) -> Produto:
        return Produto(
            codigo=row["id"],
            nome=row["nome"],
            tamanho=row["tamanho"],
            quantidade=float(row["quantidade"]),
            preco=float(row["preco"]),
            tipo=row["tipo"],
            status=row.get("status", "ativo"),
            ultima_atualizacao=row.get("ultima_atualizacao"),
        )
