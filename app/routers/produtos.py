from __future__ import annotations

from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.exceptions import DatabaseUnavailableError, ProdutoNotFoundError, ProdutoValidationError
from app.repositories import ProdutoRepository
from app.schemas.produto import ProdutoCreate, ProdutoDeleteResponse, ProdutoResponse, ProdutoUpdate
from app.services import ProdutoService


router = APIRouter(prefix="/produtos", tags=["produtos"])


def get_produto_service() -> ProdutoService:
    return ProdutoService(ProdutoRepository())


def raise_http_error(exc: Exception) -> NoReturn:
    if isinstance(exc, ProdutoNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if isinstance(exc, ProdutoValidationError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if isinstance(exc, DatabaseUnavailableError):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    raise exc


@router.get("", response_model=list[ProdutoResponse])
def listar_produtos(service: ProdutoService = Depends(get_produto_service)) -> list[ProdutoResponse]:
    try:
        return service.listar_produtos()
    except Exception as exc:
        raise_http_error(exc)


@router.get("/busca", response_model=list[ProdutoResponse])
def pesquisar_produtos_por_nome(
    termo: str = Query(..., min_length=1),
    service: ProdutoService = Depends(get_produto_service),
) -> list[ProdutoResponse]:
    try:
        return service.pesquisar_por_nome(termo)
    except Exception as exc:
        raise_http_error(exc)


@router.get("/{codigo}", response_model=ProdutoResponse)
def obter_produto(codigo: int, service: ProdutoService = Depends(get_produto_service)) -> ProdutoResponse:
    try:
        return service.obter_produto(codigo)
    except Exception as exc:
        raise_http_error(exc)


@router.post("", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def criar_produto(
    produto: ProdutoCreate,
    service: ProdutoService = Depends(get_produto_service),
) -> ProdutoResponse:
    try:
        return service.criar_produto(produto)
    except Exception as exc:
        raise_http_error(exc)


@router.patch("/{codigo}", response_model=ProdutoResponse)
def atualizar_produto(
    codigo: int,
    produto: ProdutoUpdate,
    service: ProdutoService = Depends(get_produto_service),
) -> ProdutoResponse:
    try:
        return service.atualizar_produto(codigo, produto)
    except Exception as exc:
        raise_http_error(exc)


@router.delete("/{codigo}", response_model=ProdutoDeleteResponse)
def remover_produto(
    codigo: int,
    service: ProdutoService = Depends(get_produto_service),
) -> ProdutoDeleteResponse:
    try:
        return service.remover_produto(codigo)
    except Exception as exc:
        raise_http_error(exc)
