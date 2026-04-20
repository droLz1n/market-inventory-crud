# Market Inventory CRUD

Sistema de controle de estoque com frontend web estático, API REST em FastAPI e persistência em PostgreSQL.

O projeto foi evoluído de uma versão inicial em terminal para uma arquitetura mais organizada em camadas, mantendo o foco em estudo de CRUD, integração frontend/backend e boas práticas de organização de código.

## Visão Geral

Este projeto permite cadastrar, listar, pesquisar, atualizar e remover produtos de um estoque por meio de uma interface web conectada a uma API.

Principais objetivos do projeto:

- praticar operações CRUD completas
- integrar JavaScript no frontend com uma API REST
- persistir dados em PostgreSQL
- aplicar uma estrutura backend mais profissional com separação de responsabilidades

## Funcionalidades

- Cadastro de produtos
- Listagem de produtos em tabela e cards responsivos
- Pesquisa por código
- Pesquisa por nome
- Atualização de produto com edição controlada de campos
- Remoção de produto com confirmação visual
- Dashboard com indicadores de estoque
- Documentação automática da API com Swagger

## Stack Utilizada

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

### Banco de Dados

- PostgreSQL

## Arquitetura do Backend

O backend foi organizado em camadas para deixar o projeto mais limpo, escalável e fácil de manter:

```text
app/
  main.py
  db.py
  exceptions.py
  domain/
    produto.py
  schemas/
    produto.py
  repositories/
    produto_repository.py
  services/
    produto_service.py
  routers/
    produtos.py

api.py
```

### Responsabilidade de cada camada

- `app/main.py`
  Cria a aplicação FastAPI, configura CORS, lifecycle e registra rotas.

- `app/db.py`
  Centraliza a configuração do PostgreSQL, criação de conexão e garantia da estrutura mínima da tabela.

- `app/schemas/`
  Define os modelos Pydantic usados para entrada e saída da API.

- `app/domain/`
  Representa a entidade de domínio `Produto`.

- `app/repositories/`
  Concentra o acesso ao banco e as consultas SQL.

- `app/services/`
  Contém regras de negócio, validações e conversões entre banco e resposta da API.

- `app/routers/`
  Expõe os endpoints HTTP.

- `api.py`
  Mantido como ponto de entrada simples para compatibilidade com `uvicorn api:app --reload`.

## Estrutura do Projeto

```text
market-inventory-crud/
  app/
  images/
  menu/
  modulos/
  pages/
  styles/
  api.py
  index.html
  main.py
  script.js
```

### Observações importantes

- `app/` contém a versão atual e recomendada do backend.
- `main.py` e `modulos/classes.py` representam a versão anterior em terminal e podem ser úteis como referência de evolução do projeto.
- `pages/` contém as telas do frontend.

## Telas do Frontend

O frontend possui as seguintes páginas:

- `index.html` — página inicial
- `pages/dashboard.html` — dashboard com indicadores
- `pages/listar_produto.html` — listagem de produtos
- `pages/add_produto.html` — cadastro
- `pages/atualizar_produto.html` — atualização
- `pages/pesquisa_codigo.html` — busca por código
- `pages/pesquisa_nome.html` — busca por nome
- `pages/remover_produto.html` — remoção

## Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd market-inventory-crud
```

### 2. Criar e ativar ambiente virtual

#### Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Instalar dependências

Se você ainda não tiver as dependências instaladas:

```bash
pip install fastapi uvicorn psycopg2-binary pydantic
```

### 4. Configurar o PostgreSQL

O backend usa por padrão:

- `DB_NAME=market_inventory`
- `DB_USER=postgres`
- `DB_PASSWORD=9999`
- `DB_HOST=localhost`
- `DB_PORT=5432`

Você pode manter esses valores ou sobrescrever por variáveis de ambiente.

#### Exemplo no PowerShell

```powershell
$env:DB_NAME="market_inventory"
$env:DB_USER="postgres"
$env:DB_PASSWORD="9999"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
```

### 5. Subir a API

Forma recomendada:

```bash
uvicorn app.main:app --reload
```

Forma compatível com o ponto de entrada simplificado:

```bash
uvicorn api:app --reload
```

A API ficará disponível em:

- `http://127.0.0.1:8000`
- documentação Swagger: `http://127.0.0.1:8000/docs`

### 6. Executar o frontend

Como o frontend é estático, você pode servir os arquivos com uma extensão como Live Server no VS Code ou com o servidor embutido do Python.

#### Exemplo com Python

```bash
python -m http.server 5500
```

Depois, acesse:

- `http://127.0.0.1:5500`

## Banco de Dados

Na inicialização da aplicação, o backend garante a existência da tabela `produtos` e tenta adicionar as colunas complementares caso ainda não existam:

- `status`
- `ultima_atualizacao`

Além disso:

- `status` é normalizado para `ativo` ou `inativo` na resposta da API
- `ultima_atualizacao` é definida automaticamente no cadastro e atualização

## Endpoints da API

### Listar produtos

```http
GET /produtos
```

### Buscar produto por código

```http
GET /produtos/{codigo}
```

### Buscar produtos por nome

```http
GET /produtos/busca?termo=arroz
```

### Criar produto

```http
POST /produtos
Content-Type: application/json
```

Exemplo de payload:

```json
{
  "nome": "Arroz Tio João branco tipo 1 5kg",
  "quantidade": 20,
  "preco": 22.90,
  "tipo": "und",
  "status": "ativo"
}
```

### Atualizar produto

```http
PATCH /produtos/{codigo}
Content-Type: application/json
```

Exemplo de payload:

```json
{
  "preco": 24.50,
  "status": "inativo"
}
```

### Remover produto

```http
DELETE /produtos/{codigo}
```

## Exemplo de Resposta da API

```json
{
  "codigo": 1,
  "nome": "Arroz Tio João branco tipo 1 5kg",
  "tipo": "Unidade",
  "quantidade": 20,
  "preco": 22.9,
  "status": "ativo",
  "ultimaAtualizacao": "20/04/2026"
}
```

## Decisões Técnicas

- O frontend utiliza `fetch` para se comunicar com a API.
- O backend foi separado em camadas para melhorar manutenção e legibilidade.
- O projeto mantém compatibilidade com o comando `uvicorn api:app --reload`.
- O campo `status` é convertido internamente para se adaptar ao tipo real definido no banco.
- O campo `ultimaAtualizacao` não é digitado no frontend; ele é gerado automaticamente pela API.

## Melhorias Futuras

- autenticação de usuários
- paginação na listagem
- filtros por status e tipo
- testes automatizados
- arquivo `requirements.txt`
- containerização com Docker
- deploy da API e do banco

## Aprendizados Envolvidos

Este projeto é um bom estudo prático de:

- organização de backend com FastAPI
- integração entre frontend estático e API REST
- modelagem de entrada e saída com Pydantic
- persistência com PostgreSQL
- refatoração de código para arquitetura em camadas

## Autor

Projeto desenvolvido para estudo e evolução prática de desenvolvimento full stack com Python, FastAPI, PostgreSQL, HTML, CSS e JavaScript.

