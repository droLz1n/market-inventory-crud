/* Dados compartilhados */
let produtosCache = {};
const API_BASE_URL = `http://${window.location.hostname || "127.0.0.1"}:8000`;

function montarUrlApi(caminho) {
    return `${API_BASE_URL}${caminho}`;
}

async function fazerRequisicaoApi(caminho, opcoes = {}) {
    const configuracao = {
        method: opcoes.method || "GET",
        headers: { ...(opcoes.headers || {}) }
    };

    if (opcoes.body) {
        configuracao.body = opcoes.body;
        configuracao.headers["Content-Type"] = "application/json";
    }

    const response = await fetch(montarUrlApi(caminho), configuracao);
    const tipoConteudo = response.headers.get("content-type") || "";
    const respostaJson = tipoConteudo.includes("application/json");
    const dados = respostaJson ? await response.json() : null;

    if (!response.ok) {
        const erro = new Error(dados?.detail || "Nao foi possivel concluir a requisicao para a API.");
        erro.status = response.status;
        throw erro;
    }

    return dados;
}

function atualizarProdutosCache(produtos) {
    produtosCache = {};
    produtos.forEach((produto) => {
        produtosCache[produto.codigo] = produto;
    });
}

async function carregarProdutosDaApi() {
    const produtos = await fazerRequisicaoApi("/produtos");
    atualizarProdutosCache(produtos);
    return produtos;
}

async function buscarProdutoDaApi(codigo) {
    const produto = await fazerRequisicaoApi(`/produtos/${codigo}`);
    produtosCache[produto.codigo] = produto;
    return produto;
}

async function buscarProdutosPorNomeDaApi(termo) {
    return await fazerRequisicaoApi(`/produtos/busca?termo=${encodeURIComponent(termo)}`);
}

async function criarProdutoDaApi(dadosProduto) {
    const produto = await fazerRequisicaoApi("/produtos", {
        method: "POST",
        body: JSON.stringify(dadosProduto)
    });

    produtosCache[produto.codigo] = produto;
    return produto;
}

async function atualizarProdutoDaApi(codigo, dadosProduto) {
    const produto = await fazerRequisicaoApi(`/produtos/${codigo}`, {
        method: "PATCH",
        body: JSON.stringify(dadosProduto)
    });

    produtosCache[produto.codigo] = produto;
    return produto;
}

async function removerProdutoDaApi(codigo) {
    const resposta = await fazerRequisicaoApi(`/produtos/${codigo}`, {
        method: "DELETE"
    });

    delete produtosCache[codigo];
    return resposta.produto;
}

function obterMensagemErro(error) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return "Ocorreu um erro inesperado ao conversar com a API.";
}

function obterProdutosOrdenados() {
    return Object.values(produtosCache).sort((produtoA, produtoB) => produtoA.codigo - produtoB.codigo);
}

function obterBaseProjeto() {
    if (window.location.protocol === "file:") {
        return "";
    }

    if (window.location.hostname.endsWith("github.io")) {
        const segmentos = window.location.pathname.split("/").filter(Boolean);
        return segmentos.length > 0 ? `/${segmentos[0]}` : "";
    }

    return "";
}

function resolverCaminhoProjeto(caminho) {
    const caminhoNormalizado = caminho.replace(/^\/+/, "");
    const baseProjeto = obterBaseProjeto();
    return `${baseProjeto}/${caminhoNormalizado}`;
}

/* Menu lateral */
async function carregarMenu() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) {
        return;
    }

    try {
        const response = await fetch(resolverCaminhoProjeto("menu/menu.html"));
        const data = await response.text();
        menuContainer.innerHTML = data;
        menuContainer.querySelectorAll("[data-caminho]").forEach((link) => {
            link.setAttribute("href", resolverCaminhoProjeto(link.dataset.caminho));
        });
        inicializarMenu();
    } catch (error) {
        console.error("Erro ao carregar o menu:", error);
    }
}

/* Utilitarios */
function formatarPreco(preco) {
    return `R$ ${Number(preco).toFixed(2).replace(".", ",")}`;
}

function formatarStatus(status) {
    return status === "ativo" ? "Ativo" : "Inativo";
}

function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function normalizarTextoPrecoDigitado(valor) {
    const caracteres = String(valor).replace(/[^\d,.]/g, "");

    if (!caracteres) {
        return "";
    }

    const terminouSeparador = /[,.]$/.test(caracteres);
    const ultimoSeparador = Math.max(caracteres.lastIndexOf(","), caracteres.lastIndexOf("."));
    let parteInteira = "";
    let parteDecimal = "";

    if (ultimoSeparador >= 0) {
        parteInteira = caracteres.slice(0, ultimoSeparador).replace(/\D/g, "");
        parteDecimal = caracteres.slice(ultimoSeparador + 1).replace(/\D/g, "").slice(0, 2);
    } else {
        parteInteira = caracteres.replace(/\D/g, "");
    }

    parteInteira = parteInteira.replace(/^0+(?=\d)/, "");

    if (!parteInteira && (parteDecimal || ultimoSeparador === 0)) {
        parteInteira = "0";
    }

    if (ultimoSeparador >= 0) {
        if (terminouSeparador && !parteDecimal) {
            return `${parteInteira || "0"},`;
        }

        if (parteDecimal) {
            return `${parteInteira || "0"},${parteDecimal}`;
        }

        return parteInteira || "0";
    }

    return parteInteira;
}

function converterTextoPrecoParaNumero(valor) {
    const valorNormalizado = normalizarTextoPrecoDigitado(valor).replace(/,$/, "");

    if (!valorNormalizado) {
        return null;
    }

    const numero = Number(valorNormalizado.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
}

function formatarPrecoParaCampo(valor) {
    const numero = converterTextoPrecoParaNumero(valor);

    if (numero === null) {
        return "";
    }

    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function atualizarEstadoCampoMoeda(campo) {
    const container = campo.closest(".campo-moeda");
    if (!container) {
        return;
    }

    container.classList.toggle("campo-moeda--desabilitado", campo.disabled);
}

function inicializarCamposPreco() {
    document.querySelectorAll("[data-campo-preco]").forEach((campo) => {
        atualizarEstadoCampoMoeda(campo);

        if (campo.value) {
            campo.value = formatarPrecoParaCampo(campo.value);
        }

        campo.addEventListener("input", function () {
            this.value = normalizarTextoPrecoDigitado(this.value);
        });

        campo.addEventListener("blur", function () {
            if (!this.value) {
                return;
            }

            this.value = formatarPrecoParaCampo(this.value);
        });
    });
}

function formatarQuantidade(produto) {
    return String(produto.quantidade).replace(".", ",");
}

/* Adicionar Produto */
function inicializarPaginaCadastro() {
    const formularioCadastro = document.querySelector(".form-cadastro-produto");
    if (!formularioCadastro) {
        return;
    }

    formularioCadastro.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nome = document.getElementById("nome_do_produto").value.trim();
        const quantidade = Number(document.getElementById("quantidade").value);
        const tipo = document.getElementById("unidade").value;
        const campoPreco = document.getElementById("preco");
        const preco = converterTextoPrecoParaNumero(campoPreco.value);

        if (preco === null) {
            alert("Digite um preço válido no formato 0,00.");
            campoPreco.focus();
            return;
        }

        try {
            const produto = await criarProdutoDaApi({
                nome,
                quantidade,
                tipo,
                preco,
                status: "ativo"
            });

            alert(`Produto "${produto.nome}" cadastrado com sucesso com o codigo ${produto.codigo}.`);
            formularioCadastro.reset();
            campoPreco.value = "";
        } catch (error) {
            alert(obterMensagemErro(error));
        }
    });
}

/* Home */
function renderizarHome() {
    const totalProdutos = document.getElementById("home-total-produtos");
    const totalAtivos = document.getElementById("home-total-ativos");
    const totalInativos = document.getElementById("home-total-inativos");
    const listaRecentes = document.getElementById("home-lista-recentes");
    const produtos = obterProdutosOrdenados();

    if (!totalProdutos || !totalAtivos || !totalInativos || !listaRecentes) {
        return;
    }

    totalProdutos.textContent = produtos.length;
    totalAtivos.textContent = produtos.filter((produto) => produto.status === "ativo").length;
    totalInativos.textContent = produtos.filter((produto) => produto.status === "inativo").length;
    listaRecentes.innerHTML = "";

    produtos.slice(0, 4).forEach((produto) => {
        const item = document.createElement("article");
        item.className = "home-produto-item card-branco";
        item.innerHTML = `
            <div class="home-produto-item__principal">
                <strong>${produto.nome}</strong>
                <span>Código ${produto.codigo}</span>
            </div>
            <div class="home-produto-item__secundario">
                <span>${formatarQuantidade(produto)} em estoque</span>
                <span class="status-produto status-produto--${produto.status}">${formatarStatus(produto.status)}</span>
            </div>
        `;
        listaRecentes.appendChild(item);
    });
}

/* Dashboard */
function renderizarDashboard() {
    const totalProdutos = document.getElementById("dashboard-total-produtos");
    const totalProdutosVisual = document.getElementById("dashboard-total-produtos-visual");
    const totalAtivos = document.getElementById("dashboard-total-ativos");
    const totalInativos = document.getElementById("dashboard-total-inativos");
    const valorEstoque = document.getElementById("dashboard-valor-estoque");
    const listaTopQuantidade = document.getElementById("dashboard-top-quantidade");
    const listaAtualizacoes = document.getElementById("dashboard-ultimas-atualizacoes");
    const anelStatus = document.getElementById("dashboard-status-anel");
    const produtos = Object.values(produtosCache);

    if (
        !totalProdutos ||
        !totalProdutosVisual ||
        !totalAtivos ||
        !totalInativos ||
        !valorEstoque ||
        !listaTopQuantidade ||
        !listaAtualizacoes ||
        !anelStatus
    ) {
        return;
    }

    const quantidadeAtivos = produtos.filter((produto) => produto.status === "ativo").length;
    const quantidadeInativos = produtos.filter((produto) => produto.status === "inativo").length;
    const valorTotalEstoque = produtos.reduce(
        (acumulador, produto) => acumulador + (produto.preco * produto.quantidade),
        0
    );
    const anguloAtivos = produtos.length > 0 ? (quantidadeAtivos / produtos.length) * 360 : 0;

    totalProdutos.textContent = produtos.length;
    totalProdutosVisual.textContent = produtos.length;
    totalAtivos.textContent = quantidadeAtivos;
    totalInativos.textContent = quantidadeInativos;
    valorEstoque.textContent = formatarPreco(valorTotalEstoque);
    anelStatus.style.background = `conic-gradient(#000080 0deg ${anguloAtivos}deg, #b91c1c ${anguloAtivos}deg 360deg)`;

    listaTopQuantidade.innerHTML = "";
    listaAtualizacoes.innerHTML = "";

    produtos
        .slice()
        .sort((produtoA, produtoB) => produtoB.quantidade - produtoA.quantidade)
        .slice(0, 4)
        .forEach((produto, indice) => {
            const item = document.createElement("article");
            item.className = "dashboard-lista-item card-branco";
            item.innerHTML = `
                <div class="dashboard-lista-item__principal">
                    <span class="dashboard-lista-item__indice icone-box">#${indice + 1}</span>
                    <div>
                        <strong>${produto.nome}</strong>
                        <p>Código ${produto.codigo}</p>
                    </div>
                </div>
                <div class="dashboard-lista-item__secundario">
                    <strong>${formatarQuantidade(produto)}</strong>
                    <span>${produto.tipo}</span>
                </div>
            `;
            listaTopQuantidade.appendChild(item);
        });

    produtos
        .slice()
        .sort((produtoA, produtoB) => {
            const [diaA, mesA, anoA] = produtoA.ultimaAtualizacao.split("/");
            const [diaB, mesB, anoB] = produtoB.ultimaAtualizacao.split("/");
            const dataA = new Date(`${anoA}-${mesA}-${diaA}`);
            const dataB = new Date(`${anoB}-${mesB}-${diaB}`);
            return dataB - dataA;
        })
        .slice(0, 4)
        .forEach((produto) => {
            const item = document.createElement("article");
            item.className = "dashboard-atualizacao-item card-branco";
            item.innerHTML = `
                <div>
                    <strong>${produto.nome}</strong>
                    <p>Atualizado em ${produto.ultimaAtualizacao}</p>
                </div>
                <span class="status-produto status-produto--${produto.status}">${formatarStatus(produto.status)}</span>
            `;
            listaAtualizacoes.appendChild(item);
        });
}

/* Listar Produto */
function renderizarProdutos() {
    const corpoTabela = document.getElementById("lista-produtos");
    const listaProdutosMobile = document.getElementById("lista-produtos-mobile");
    const estadoVazio = document.getElementById("estado-vazio");
    const totalProdutos = document.getElementById("total-produtos");
    const valorEstoque = document.getElementById("valor-estoque");
    const produtos = Object.values(produtosCache);

    if (!corpoTabela || !listaProdutosMobile || !estadoVazio || !totalProdutos || !valorEstoque) {
        return;
    }

    const valorTotalEstoque = produtos.reduce(
        (acumulador, produto) => acumulador + (produto.preco * produto.quantidade),
        0
    );

    totalProdutos.textContent = produtos.length;
    valorEstoque.textContent = formatarPreco(valorTotalEstoque);
    corpoTabela.innerHTML = "";
    listaProdutosMobile.innerHTML = "";

    if (produtos.length === 0) {
        estadoVazio.style.display = "grid";
        return;
    }

    estadoVazio.style.display = "none";

    produtos.forEach((produto) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${produto.tipo}</td>
            <td>${formatarQuantidade(produto)}</td>
            <td>${formatarPreco(produto.preco)}</td>
            <td><span class="status-produto status-produto--${produto.status}">${formatarStatus(produto.status)}</span></td>
        `;
        corpoTabela.appendChild(linha);

        const itemMobile = document.createElement("details");
        itemMobile.className = "produto-mobile-card card-branco";
        itemMobile.innerHTML = `
            <summary class="produto-mobile-card__resumo">
                <div class="produto-mobile-card__principal">
                    <strong>${produto.nome}</strong>
                    <span>Código ${produto.codigo}</span>
                </div>
                <div class="produto-mobile-card__resumo-lateral">
                    <span class="status-produto status-produto--${produto.status}">${formatarStatus(produto.status)}</span>
                    <i class="bi bi-chevron-down produto-mobile-card__icone"></i>
                </div>
            </summary>
            <div class="produto-mobile-card__detalhes">
                <div class="produto-mobile-card__linha">
                    <span class="produto-mobile-card__rotulo card-label">Tipo</span>
                    <strong>${produto.tipo}</strong>
                </div>
                <div class="produto-mobile-card__linha">
                    <span class="produto-mobile-card__rotulo card-label">Quantidade</span>
                    <strong>${formatarQuantidade(produto)}</strong>
                </div>
                <div class="produto-mobile-card__linha">
                    <span class="produto-mobile-card__rotulo card-label">Preço</span>
                    <strong>${formatarPreco(produto.preco)}</strong>
                </div>
            </div>
        `;
        listaProdutosMobile.appendChild(itemMobile);
    });
}

/* Atualizar Produto */
function preencherProdutoAtualizacao(produto) {
    document.getElementById("produto-codigo").textContent = produto.codigo;
    document.getElementById("produto-tipo").textContent = produto.tipo;
    document.getElementById("produto-atualizacao").textContent = produto.ultimaAtualizacao;
    document.getElementById("editar-nome").value = produto.nome;
    document.getElementById("editar-preco").value = formatarPrecoParaCampo(produto.preco);
    document.getElementById("editar-quantidade").value = produto.quantidade;
    document.getElementById("editar-status").value = produto.status;
    document.getElementById("estado-produto").classList.add("oculto");
    document.getElementById("form-atualizacao-produto").classList.remove("oculto");
}

function resetarEdicao() {
    document.querySelectorAll('.controle-edicao input[type="checkbox"]').forEach((checkbox) => {
        checkbox.checked = false;

        const alvo = document.getElementById(checkbox.dataset.target);
        if (!alvo) {
            return;
        }

        alvo.disabled = true;
        atualizarEstadoCampoMoeda(alvo);
        alvo.closest(".campo-atualizacao").classList.remove("campo-atualizacao--ativo");
    });
}

function mostrarProdutoNaoEncontrado(codigo) {
    const estadoProduto = document.getElementById("estado-produto");
    const formulario = document.getElementById("form-atualizacao-produto");

    estadoProduto.classList.remove("oculto");
    formulario.classList.add("oculto");
    estadoProduto.querySelector("h3").textContent = "Produto não encontrado";
    estadoProduto.querySelector("p").textContent = `Nenhum produto foi encontrado para o código ${codigo}.`;
}

function mostrarEstadoInicialAtualizacao() {
    const estadoProduto = document.getElementById("estado-produto");
    const formulario = document.getElementById("form-atualizacao-produto");

    estadoProduto.classList.remove("oculto");
    formulario.classList.add("oculto");
    estadoProduto.querySelector("h3").textContent = "Nenhum produto selecionado";
    estadoProduto.querySelector("p").textContent = "Depois da busca, o produto encontrado aparecerá aqui com nome, preço e quantidade prontos para edição controlada.";
}

function configurarControlesEdicao() {
    document.querySelectorAll('.controle-edicao input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            const alvo = document.getElementById(this.dataset.target);
            if (!alvo) {
                return;
            }

            alvo.disabled = !this.checked;
            atualizarEstadoCampoMoeda(alvo);
            alvo.closest(".campo-atualizacao").classList.toggle("campo-atualizacao--ativo", this.checked);
        });
    });
}

function montarPayloadAtualizacao() {
    const dadosProduto = {};

    if (document.querySelector('[data-target="editar-nome"]').checked) {
        dadosProduto.nome = document.getElementById("editar-nome").value.trim();
    }

    if (document.querySelector('[data-target="editar-preco"]').checked) {
        const preco = converterTextoPrecoParaNumero(document.getElementById("editar-preco").value);

        if (preco === null) {
            throw new Error("Digite um preço válido no formato 0,00.");
        }

        dadosProduto.preco = preco;
    }

    if (document.querySelector('[data-target="editar-quantidade"]').checked) {
        dadosProduto.quantidade = Number(document.getElementById("editar-quantidade").value);
    }

    if (document.querySelector('[data-target="editar-status"]').checked) {
        dadosProduto.status = document.getElementById("editar-status").value;
    }

    return dadosProduto;
}

function inicializarPaginaAtualizacao() {
    const buscaForm = document.getElementById("busca-produto-form");
    const atualizacaoForm = document.getElementById("form-atualizacao-produto");

    if (!buscaForm || !atualizacaoForm) {
        return;
    }

    configurarControlesEdicao();
    mostrarEstadoInicialAtualizacao();

    buscaForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo-produto").value.trim();
        resetarEdicao();

        try {
            const produto = await buscarProdutoDaApi(codigo);
            preencherProdutoAtualizacao(produto);
        } catch (error) {
            if (error.status === 404) {
                mostrarProdutoNaoEncontrado(codigo);
                return;
            }

            alert(obterMensagemErro(error));
        }
    });

    atualizacaoForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const codigo = document.getElementById("produto-codigo").textContent.trim();
        let dadosProduto;

        if (!codigo || codigo === "-") {
            alert("Pesquise um produto antes de tentar salvar.");
            return;
        }

        try {
            dadosProduto = montarPayloadAtualizacao();
        } catch (error) {
            alert(obterMensagemErro(error));
            return;
        }

        if (Object.keys(dadosProduto).length === 0) {
            alert("Marque pelo menos um campo para liberar a edição antes de salvar.");
            return;
        }

        try {
            const produtoAtualizado = await atualizarProdutoDaApi(codigo, dadosProduto);
            resetarEdicao();
            preencherProdutoAtualizacao(produtoAtualizado);
            alert("Produto atualizado com sucesso.");
        } catch (error) {
            alert(obterMensagemErro(error));
        }
    });
}

/* Pesquisar por Codigo */
function preencherResultadoPesquisaCodigo(produto) {
    document.getElementById("resultado-codigo").textContent = produto.codigo;
    document.getElementById("resultado-nome").textContent = produto.nome;
    document.getElementById("resultado-tipo").textContent = produto.tipo;
    document.getElementById("resultado-preco").textContent = formatarPreco(produto.preco);
    document.getElementById("resultado-quantidade").textContent = formatarQuantidade(produto);
    document.getElementById("resultado-status").textContent = formatarStatus(produto.status);
    document.getElementById("resultado-status").className = `status-produto status-produto--${produto.status}`;
    document.getElementById("resultado-atualizacao").textContent = produto.ultimaAtualizacao;
    document.getElementById("estado-busca-codigo").classList.add("oculto");
    document.getElementById("resultado-busca-codigo").classList.remove("oculto");
}

function mostrarEstadoInicialPesquisaCodigo() {
    const estado = document.getElementById("estado-busca-codigo");
    const resultado = document.getElementById("resultado-busca-codigo");

    if (!estado || !resultado) {
        return;
    }

    estado.classList.remove("oculto");
    resultado.classList.add("oculto");
    estado.querySelector("h3").textContent = "Nenhum produto pesquisado";
    estado.querySelector("p").textContent = "Digite um código para localizar um produto e visualizar os detalhes do item encontrado.";
}

function mostrarProdutoNaoEncontradoPesquisaCodigo(codigo) {
    const estado = document.getElementById("estado-busca-codigo");
    const resultado = document.getElementById("resultado-busca-codigo");

    estado.classList.remove("oculto");
    resultado.classList.add("oculto");
    estado.querySelector("h3").textContent = "Produto não encontrado";
    estado.querySelector("p").textContent = `Nenhum produto foi encontrado para o código ${codigo}.`;
}

function inicializarPaginaPesquisaCodigo() {
    const buscaForm = document.getElementById("busca-codigo-form");
    if (!buscaForm) {
        return;
    }

    mostrarEstadoInicialPesquisaCodigo();

    buscaForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const codigo = document.getElementById("pesquisa-codigo").value.trim();

        try {
            const produto = await buscarProdutoDaApi(codigo);
            preencherResultadoPesquisaCodigo(produto);
        } catch (error) {
            if (error.status === 404) {
                mostrarProdutoNaoEncontradoPesquisaCodigo(codigo);
                return;
            }

            alert(obterMensagemErro(error));
        }
    });
}

/* Pesquisar por Nome */
function renderizarResultadosPesquisaNome(produtos) {
    const listaResultados = document.getElementById("lista-resultados-nome");
    const estado = document.getElementById("estado-busca-nome");
    const painelResultado = document.getElementById("resultado-busca-nome");
    const totalResultados = document.getElementById("total-resultados-nome");
    const resumoResultados = document.getElementById("resumo-resultado-nome");

    if (!listaResultados || !estado || !painelResultado || !totalResultados || !resumoResultados) {
        return;
    }

    listaResultados.innerHTML = "";
    totalResultados.textContent = `${produtos.length} resultado(s)`;
    estado.classList.add("oculto");
    painelResultado.classList.remove("oculto");
    resumoResultados.classList.remove("oculto");

    produtos.forEach((produto) => {
        const item = document.createElement("article");
        item.className = "item-resultado-nome card-branco empilha-md";
        item.innerHTML = `
            <span class="item-resultado-nome__coluna item-resultado-nome__coluna--codigo">
                <span class="item-resultado-nome__rotulo card-label">Código</span>
                <strong>${produto.codigo}</strong>
            </span>
            <span class="item-resultado-nome__coluna item-resultado-nome__coluna--nome">
                <span class="item-resultado-nome__rotulo card-label">Nome</span>
                <strong>${produto.nome}</strong>
            </span>
            <span class="item-resultado-nome__coluna item-resultado-nome__coluna--quantidade">
                <span class="item-resultado-nome__rotulo card-label">Quantidade</span>
                <strong>${formatarQuantidade(produto)}</strong>
            </span>
            <span class="item-resultado-nome__coluna item-resultado-nome__coluna--status">
                <span class="item-resultado-nome__rotulo card-label">Status</span>
                <span class="status-produto status-produto--${produto.status}">${formatarStatus(produto.status)}</span>
            </span>
        `;
        listaResultados.appendChild(item);
    });
}

function mostrarEstadoInicialPesquisaNome() {
    const estado = document.getElementById("estado-busca-nome");
    const painelResultado = document.getElementById("resultado-busca-nome");
    const resumoResultados = document.getElementById("resumo-resultado-nome");
    const listaResultados = document.getElementById("lista-resultados-nome");

    if (!estado || !painelResultado || !resumoResultados || !listaResultados) {
        return;
    }

    listaResultados.innerHTML = "";
    estado.classList.remove("oculto");
    painelResultado.classList.add("oculto");
    resumoResultados.classList.add("oculto");
    estado.querySelector("h3").textContent = "Nenhuma pesquisa realizada";
    estado.querySelector("p").textContent = "Digite parte do nome de um produto para visualizar todos os itens relacionados encontrados no estoque.";
}

function mostrarProdutoNaoEncontradoPesquisaNome(termo) {
    const estado = document.getElementById("estado-busca-nome");
    const painelResultado = document.getElementById("resultado-busca-nome");
    const resumoResultados = document.getElementById("resumo-resultado-nome");
    const listaResultados = document.getElementById("lista-resultados-nome");

    if (!estado || !painelResultado || !resumoResultados || !listaResultados) {
        return;
    }

    listaResultados.innerHTML = "";
    estado.classList.remove("oculto");
    painelResultado.classList.add("oculto");
    resumoResultados.classList.add("oculto");
    estado.querySelector("h3").textContent = "Nenhum produto encontrado";
    estado.querySelector("p").textContent = `Nenhum item foi encontrado para a pesquisa "${termo}".`;
}

function inicializarPaginaPesquisaNome() {
    const buscaForm = document.getElementById("busca-nome-form");
    if (!buscaForm) {
        return;
    }

    mostrarEstadoInicialPesquisaNome();

    buscaForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const valorPesquisa = document.getElementById("pesquisa-nome").value.trim();
        if (!normalizarTexto(valorPesquisa)) {
            mostrarEstadoInicialPesquisaNome();
            return;
        }

        try {
            const produtos = await buscarProdutosPorNomeDaApi(valorPesquisa);

            if (produtos.length === 0) {
                mostrarProdutoNaoEncontradoPesquisaNome(valorPesquisa);
                return;
            }

            renderizarResultadosPesquisaNome(produtos);
        } catch (error) {
            alert(obterMensagemErro(error));
        }
    });
}

/* Remover Produto */
function preencherProdutoRemocao(produto) {
    document.getElementById("remover-codigo").textContent = produto.codigo;
    document.getElementById("remover-tipo").textContent = produto.tipo;
    document.getElementById("remover-atualizacao").textContent = produto.ultimaAtualizacao;
    document.getElementById("remover-nome").textContent = produto.nome;
    document.getElementById("remover-quantidade").textContent = formatarQuantidade(produto);
    document.getElementById("remover-status").textContent = formatarStatus(produto.status);
    document.getElementById("remover-status").className = `status-produto status-produto--${produto.status}`;
    document.getElementById("estado-remocao").classList.add("oculto");
    document.getElementById("painel-produto-remocao").classList.remove("oculto");
    document.getElementById("mensagem-remocao").classList.add("oculto");
}

function mostrarEstadoInicialRemocao() {
    const estado = document.getElementById("estado-remocao");
    const painel = document.getElementById("painel-produto-remocao");
    const mensagem = document.getElementById("mensagem-remocao");

    if (!estado || !painel || !mensagem) {
        return;
    }

    estado.classList.remove("oculto");
    painel.classList.add("oculto");
    mensagem.classList.add("oculto");
    estado.querySelector("h3").textContent = "Nenhum produto selecionado";
    estado.querySelector("p").textContent = "Pesquise um código para visualizar o produto que poderá ser removido do estoque.";
}

function mostrarProdutoNaoEncontradoRemocao(codigo) {
    const estado = document.getElementById("estado-remocao");
    const painel = document.getElementById("painel-produto-remocao");
    const mensagem = document.getElementById("mensagem-remocao");

    if (!estado || !painel || !mensagem) {
        return;
    }

    estado.classList.remove("oculto");
    painel.classList.add("oculto");
    mensagem.classList.add("oculto");
    estado.querySelector("h3").textContent = "Produto não encontrado";
    estado.querySelector("p").textContent = `Nenhum produto foi encontrado para o código ${codigo}.`;
}

function mostrarMensagemRemocao(produto) {
    const estado = document.getElementById("estado-remocao");
    const painel = document.getElementById("painel-produto-remocao");
    const mensagem = document.getElementById("mensagem-remocao");

    if (!estado || !painel || !mensagem) {
        return;
    }

    estado.classList.add("oculto");
    painel.classList.add("oculto");
    mensagem.classList.remove("oculto");
    mensagem.querySelector("h3").textContent = "Produto removido com sucesso";
    mensagem.querySelector("p").textContent = `O produto ${produto.nome} (código ${produto.codigo}) foi removido do estoque.`;
}

function inicializarPaginaRemocao() {
    const buscaForm = document.getElementById("busca-remocao-form");
    const botaoRemover = document.getElementById("botao-confirmar-remocao");
    const campoCodigo = document.getElementById("codigo-remocao");
    let produtoSelecionado = null;

    if (!buscaForm || !botaoRemover || !campoCodigo) {
        return;
    }

    mostrarEstadoInicialRemocao();

    buscaForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const codigo = campoCodigo.value.trim();
        produtoSelecionado = null;

        if (!codigo) {
            mostrarEstadoInicialRemocao();
            return;
        }

        try {
            produtoSelecionado = await buscarProdutoDaApi(codigo);
            preencherProdutoRemocao(produtoSelecionado);
        } catch (error) {
            if (error.status === 404) {
                mostrarProdutoNaoEncontradoRemocao(codigo);
                return;
            }

            alert(obterMensagemErro(error));
        }
    });

    botaoRemover.addEventListener("click", async function () {
        if (!produtoSelecionado) {
            return;
        }

        try {
            const produtoRemovido = await removerProdutoDaApi(produtoSelecionado.codigo);
            mostrarMensagemRemocao(produtoRemovido || produtoSelecionado);
            campoCodigo.value = "";
            produtoSelecionado = null;
        } catch (error) {
            alert(obterMensagemErro(error));
        }
    });
}

/* Inicializacao global */
document.addEventListener("DOMContentLoaded", async function () {
    await carregarMenu();
    inicializarCamposPreco();

    try {
        await carregarProdutosDaApi();
    } catch (error) {
        console.error("Erro ao carregar produtos da API:", error);
    }

    renderizarHome();
    renderizarDashboard();
    renderizarProdutos();
    inicializarPaginaCadastro();
    inicializarPaginaAtualizacao();
    inicializarPaginaPesquisaCodigo();
    inicializarPaginaPesquisaNome();
    inicializarPaginaRemocao();
});
