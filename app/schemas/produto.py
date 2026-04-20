from __future__ import annotations

from pydantic import BaseModel, Field


class ProdutoCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)
    quantidade: float = Field(..., ge=0)
    preco: float = Field(..., ge=0)
    tipo: str = Field(..., min_length=1)
    status: str = Field(default="ativo")


class ProdutoUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=120)
    quantidade: float | None = Field(default=None, ge=0)
    preco: float | None = Field(default=None, ge=0)
    tipo: str | None = None
    status: str | None = None


class ProdutoResponse(BaseModel):
    codigo: int
    nome: str
    tipo: str
    quantidade: int | float
    preco: float
    status: str
    ultimaAtualizacao: str


class ProdutoDeleteResponse(BaseModel):
    mensagem: str
    produto: ProdutoResponse
