from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime


@dataclass(slots=True)
class Produto:
    codigo: int
    nome: str
    tamanho: str
    quantidade: float
    preco: float
    tipo: str
    status: bool | str
    ultima_atualizacao: date | datetime | str | None = None
