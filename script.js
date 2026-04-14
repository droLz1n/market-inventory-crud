/* Dados compartilhados */
const produtosMock = {
    101: {
        codigo: 101,
        nome: "Arroz Integral",
        preco: 24.90,
        quantidade: 18,
        tipo: "Unidade",
        status: "ativo",
        ultimaAtualizacao: "12/04/2026"
    },
    205: {
        codigo: 205,
        nome: "Feijão Carioca",
        preco: 9.50,
        quantidade: 42,
        tipo: "Kg",
        status: "ativo",
        ultimaAtualizacao: "09/04/2026"
    },
    309: {
        codigo: 309,
        nome: "Macarrão Espaguete",
        preco: 6.75,
        quantidade: 27,
        tipo: "Unidade",
        status: "inativo",
        ultimaAtualizacao: "03/04/2026"
    },
    412: {
        codigo: 412,
        nome: "Arroz Branco Tipo 1",
        preco: 22.30,
        quantidade: 35,
        tipo: "Unidade",
        status: "ativo",
        ultimaAtualizacao: "10/04/2026"
    },
    418: {
        codigo: 418,
        nome: "Arroz Parboilizado",
        preco: 23.80,
        quantidade: 21,
        tipo: "Unidade",
        status: "ativo",
        ultimaAtualizacao: "08/04/2026"
    },
    427: {
        codigo: 427,
        nome: "Arroz Agulhinha",
        preco: 21.90,
        quantidade: 14,
        tipo: "Unidade",
        status: "inativo",
        ultimaAtualizacao: "05/04/2026"
    }
};

/* Menu lateral */
async function carregarMenu() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) {
        return;
    }

    try {
        const response = await fetch("/menu/menu.html");
        const data = await response.text();
        menuContainer.innerHTML = data;
        inicializarMenu();
    } catch (error) {
        console.error("Erro ao carregar o menu:", error);
    }
}

/* Utilitários */
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

/* Adicionar Produto */
/* Esta seção fica reservada para futuras funções da página add_produto.html. */

/* Home */
function renderizarHome() {
    const totalProdutos = document.getElementById("home-total-produtos");
    const totalAtivos = document.getElementById("home-total-ativos");
    const totalInativos = document.getElementById("home-total-inativos");
    const listaRecentes = document.getElementById("home-lista-recentes");
    const produtos = Object.values(produtosMock).sort((produtoA, produtoB) => produtoA.codigo - produtoB.codigo);

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
                <span>${produto.quantidade} em estoque</span>
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
    const produtos = Object.values(produtosMock);

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
                    <strong>${produto.quantidade}</strong>
                    <span>unidades</span>
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
    const estadoVazio = document.getElementById("estado-vazio");
    const totalProdutos = document.getElementById("total-produtos");
    const produtos = Object.values(produtosMock);

    if (!corpoTabela || !estadoVazio || !totalProdutos) {
        return;
    }

    totalProdutos.textContent = produtos.length;
    corpoTabela.innerHTML = "";

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
            <td>${produto.quantidade}</td>
            <td>${formatarPreco(produto.preco)}</td>
            <td><span class="status-produto status-produto--${produto.status}">${formatarStatus(produto.status)}</span></td>
        `;
        corpoTabela.appendChild(linha);
    });
}

/* Atualizar Produto */
function preencherProdutoAtualizacao(produto) {
    document.getElementById("produto-codigo").textContent = produto.codigo;
    document.getElementById("produto-tipo").textContent = produto.tipo;
    document.getElementById("produto-atualizacao").textContent = produto.ultimaAtualizacao;
    document.getElementById("editar-nome").value = produto.nome;
    document.getElementById("editar-preco").value = produto.preco;
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
        alvo.closest(".campo-atualizacao").classList.remove("campo-atualizacao--ativo");
    });
}

function mostrarProdutoNaoEncontrado(codigo) {
    const estadoProduto = document.getElementById("estado-produto");
    const formulario = document.getElementById("form-atualizacao-produto");

    estadoProduto.classList.remove("oculto");
    formulario.classList.add("oculto");
    estadoProduto.querySelector("h3").textContent = "Produto não encontrado";
    estadoProduto.querySelector("p").textContent = `Nenhum produto fictício foi encontrado para o código ${codigo}. Tente 101, 205 ou 309.`;
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
            alvo.closest(".campo-atualizacao").classList.toggle("campo-atualizacao--ativo", this.checked);
        });
    });
}

function inicializarPaginaAtualizacao() {
    const buscaForm = document.getElementById("busca-produto-form");
    const atualizacaoForm = document.getElementById("form-atualizacao-produto");

    if (!buscaForm || !atualizacaoForm) {
        return;
    }

    configurarControlesEdicao();
    mostrarEstadoInicialAtualizacao();

    buscaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo-produto").value.trim();
        const produto = produtosMock[codigo];

        resetarEdicao();

        if (!produto) {
            mostrarProdutoNaoEncontrado(codigo);
            return;
        }

        preencherProdutoAtualizacao(produto);
    });

    atualizacaoForm.addEventListener("submit", function (event) {
        event.preventDefault();
    });
}

/* Pesquisar por Código */
function preencherResultadoPesquisaCodigo(produto) {
    document.getElementById("resultado-codigo").textContent = produto.codigo;
    document.getElementById("resultado-nome").textContent = produto.nome;
    document.getElementById("resultado-tipo").textContent = produto.tipo;
    document.getElementById("resultado-preco").textContent = formatarPreco(produto.preco);
    document.getElementById("resultado-quantidade").textContent = produto.quantidade;
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
    estado.querySelector("p").textContent = `Nenhum produto fictício foi encontrado para o código ${codigo}. Tente 101, 205 ou 309.`;
}

function inicializarPaginaPesquisaCodigo() {
    const buscaForm = document.getElementById("busca-codigo-form");
    if (!buscaForm) {
        return;
    }

    mostrarEstadoInicialPesquisaCodigo();

    buscaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const codigo = document.getElementById("pesquisa-codigo").value.trim();
        const produto = produtosMock[codigo];

        if (!produto) {
            mostrarProdutoNaoEncontradoPesquisaCodigo(codigo);
            return;
        }

        preencherResultadoPesquisaCodigo(produto);
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
                <strong>${produto.quantidade}</strong>
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
    estado.querySelector("p").textContent = `Nenhum item foi encontrado para a pesquisa "${termo}". Tente buscar por termos como Arroz, Feijão ou Macarrão.`;
}

function inicializarPaginaPesquisaNome() {
    const buscaForm = document.getElementById("busca-nome-form");
    if (!buscaForm) {
        return;
    }

    mostrarEstadoInicialPesquisaNome();

    buscaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const valorPesquisa = document.getElementById("pesquisa-nome").value.trim();
        const termo = normalizarTexto(valorPesquisa);
        const produtos = Object.values(produtosMock)
            .filter((produto) => normalizarTexto(produto.nome).includes(termo))
            .sort((produtoA, produtoB) => produtoA.codigo - produtoB.codigo);

        if (!termo) {
            mostrarEstadoInicialPesquisaNome();
            return;
        }

        if (produtos.length === 0) {
            mostrarProdutoNaoEncontradoPesquisaNome(valorPesquisa);
            return;
        }

        renderizarResultadosPesquisaNome(produtos);
    });
}

/* Remover Produto */
function preencherProdutoRemocao(produto) {
    document.getElementById("remover-codigo").textContent = produto.codigo;
    document.getElementById("remover-tipo").textContent = produto.tipo;
    document.getElementById("remover-atualizacao").textContent = produto.ultimaAtualizacao;
    document.getElementById("remover-nome").textContent = produto.nome;
    document.getElementById("remover-quantidade").textContent = produto.quantidade;
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
    estado.querySelector("p").textContent = `Nenhum produto fictício foi encontrado para o código ${codigo}. Tente pesquisar um código existente no estoque.`;
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
    mensagem.querySelector("p").textContent = `O produto ${produto.nome} (código ${produto.codigo}) foi removido do estoque fictício desta interface.`;
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

    buscaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const codigo = campoCodigo.value.trim();
        const produto = produtosMock[codigo];

        produtoSelecionado = null;

        if (!codigo) {
            mostrarEstadoInicialRemocao();
            return;
        }

        if (!produto) {
            mostrarProdutoNaoEncontradoRemocao(codigo);
            return;
        }

        produtoSelecionado = produto;
        preencherProdutoRemocao(produto);
    });

    botaoRemover.addEventListener("click", function () {
        if (!produtoSelecionado) {
            return;
        }

        delete produtosMock[produtoSelecionado.codigo];
        mostrarMensagemRemocao(produtoSelecionado);
        campoCodigo.value = "";
        produtoSelecionado = null;
    });
}

/* Inicialização global */
document.addEventListener("DOMContentLoaded", async function () {
    await carregarMenu();
    renderizarHome();
    renderizarDashboard();
    renderizarProdutos();
    inicializarPaginaAtualizacao();
    inicializarPaginaPesquisaCodigo();
    inicializarPaginaPesquisaNome();
    inicializarPaginaRemocao();
});
