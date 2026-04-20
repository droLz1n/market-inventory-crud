from __future__ import annotations

import unicodedata
from datetime import date, datetime
from typing import Any

from app.domain import Produto
from app.exceptions import ProdutoNotFoundError, ProdutoValidationError
from app.repositories import ProdutoRepository
from app.schemas.produto import ProdutoCreate, ProdutoDeleteResponse, ProdutoResponse, ProdutoUpdate


class ProdutoService:
    def __init__(self, repository: ProdutoRepository) -> None:
        self.repository = repository

    def listar_produtos(self) -> list[ProdutoResponse]:
        return [self._to_response(produto) for produto in self.repository.list_all()]

    def pesquisar_por_nome(self, termo: str) -> list[ProdutoResponse]:
        termo_normalizado = self._normalizar_texto(termo)
        produtos = self.repository.list_all()
        return [
            self._to_response(produto)
            for produto in produtos
            if termo_normalizado in self._normalizar_texto(produto.nome)
        ]

    def obter_produto(self, codigo: int) -> ProdutoResponse:
        produto = self.repository.get_by_id(codigo)
        if not produto:
            raise ProdutoNotFoundError("Produto nao encontrado.")
        return self._to_response(produto)

    def criar_produto(self, dados: ProdutoCreate) -> ProdutoResponse:
        nome = dados.nome.strip()
        if not nome:
            raise ProdutoValidationError("O nome do produto nao pode estar vazio.")

        tamanho, tipo_banco = self._resolver_tipo_banco(dados.tipo)
        quantidade = self._normalizar_quantidade(tipo_banco, dados.quantidade)
        status_banco = self._converter_status_para_banco(dados.status)

        produto = self.repository.create(
            nome=nome,
            tamanho=tamanho,
            quantidade=quantidade,
            preco=dados.preco,
            tipo=tipo_banco,
            status=status_banco,
        )
        return self._to_response(produto)

    def atualizar_produto(self, codigo: int, dados: ProdutoUpdate) -> ProdutoResponse:
        produto_existente = self.repository.get_by_id(codigo)
        if not produto_existente:
            raise ProdutoNotFoundError("Produto nao encontrado.")

        update_data = self._dump_update_model(dados)
        if not update_data:
            raise ProdutoValidationError("Envie pelo menos um campo para atualizar.")

        changes: dict[str, Any] = {}
        tipo_banco_final = produto_existente.tipo

        if "nome" in update_data:
            nome = update_data["nome"].strip()
            if not nome:
                raise ProdutoValidationError("O nome do produto nao pode estar vazio.")
            changes["nome"] = nome

        if "preco" in update_data:
            changes["preco"] = update_data["preco"]

        if "tipo" in update_data:
            tamanho, tipo_banco = self._resolver_tipo_banco(update_data["tipo"])
            tipo_banco_final = tipo_banco
            changes["tamanho"] = tamanho
            changes["tipo"] = tipo_banco
            if "quantidade" not in update_data:
                changes["quantidade"] = self._normalizar_quantidade(tipo_banco, produto_existente.quantidade)

        if "quantidade" in update_data:
            changes["quantidade"] = self._normalizar_quantidade(tipo_banco_final, update_data["quantidade"])

        if "status" in update_data:
            changes["status"] = self._converter_status_para_banco(update_data["status"])

        produto_atualizado = self.repository.update(codigo, changes)
        if not produto_atualizado:
            raise ProdutoNotFoundError("Produto nao encontrado.")

        return self._to_response(produto_atualizado)

    def remover_produto(self, codigo: int) -> ProdutoDeleteResponse:
        produto = self.repository.delete(codigo)
        if not produto:
            raise ProdutoNotFoundError("Produto nao encontrado.")

        return ProdutoDeleteResponse(
            mensagem="Produto removido com sucesso.",
            produto=self._to_response(produto),
        )

    def _dump_update_model(self, dados: ProdutoUpdate) -> dict[str, Any]:
        if hasattr(dados, "model_dump"):
            return dados.model_dump(exclude_none=True)
        return dados.dict(exclude_none=True)

    def _to_response(self, produto: Produto) -> ProdutoResponse:
        return ProdutoResponse(
            codigo=produto.codigo,
            nome=produto.nome,
            tipo=self._mapear_tipo_resposta(produto.tipo, produto.tamanho),
            quantidade=self._normalizar_quantidade(produto.tipo, produto.quantidade),
            preco=float(produto.preco),
            status=self._converter_status_para_resposta(produto.status),
            ultimaAtualizacao=self._formatar_data(produto.ultima_atualizacao),
        )

    def _resolver_tipo_banco(self, tipo_recebido: str) -> tuple[str, str]:
        valor = tipo_recebido.strip().lower()
        if valor in {"kg", "quilo", "quilos", "peso"}:
            return "Kg", "peso"
        if valor in {"und", "un", "unidade", "unitario"}:
            return "Und.", "unitario"
        raise ProdutoValidationError("O tipo precisa ser 'und'/'unidade' ou 'kg'.")

    def _normalizar_status(self, status: str | None) -> str:
        valor = (status or "ativo").strip().lower()
        if valor not in {"ativo", "inativo"}:
            raise ProdutoValidationError("O status precisa ser 'ativo' ou 'inativo'.")
        return valor

    def _converter_status_para_banco(self, status: str):
        status_normalizado = self._normalizar_status(status)
        if self.repository.get_status_column_type() == "boolean":
            return status_normalizado == "ativo"
        return status_normalizado

    def _converter_status_para_resposta(self, status: bool | str) -> str:
        if isinstance(status, bool):
            return "ativo" if status else "inativo"
        return self._normalizar_status(status)

    @staticmethod
    def _normalizar_texto(texto: str) -> str:
        return unicodedata.normalize("NFD", texto).encode("ascii", "ignore").decode("utf-8").lower().strip()

    @staticmethod
    def _formatar_data(valor: date | datetime | str | None) -> str:
        if isinstance(valor, datetime):
            valor = valor.date()
        if isinstance(valor, date):
            return valor.strftime("%d/%m/%Y")
        if isinstance(valor, str):
            try:
                return datetime.fromisoformat(valor).strftime("%d/%m/%Y")
            except ValueError:
                return valor
        return date.today().strftime("%d/%m/%Y")

    @staticmethod
    def _normalizar_quantidade(tipo_banco: str, quantidade: float) -> int | float:
        quantidade_float = float(quantidade)
        if tipo_banco == "unitario":
            return int(round(quantidade_float))
        return quantidade_float

    @staticmethod
    def _mapear_tipo_resposta(tipo_banco: str, tamanho: str) -> str:
        if tipo_banco == "peso" or str(tamanho).lower().startswith("kg"):
            return "Kg"
        return "Unidade"
