function carregarPagina(pagina) {
    const content = document.getElementById("content");

    switch(pagina) {
        case 'inicio':
            content.innerHTML = "<h1>Bem-vindo ao sistema</h1><p>Selecione uma opção no menu.</p>";
            break;

        case 'add':
            content.innerHTML = "<h1>Adicionar Produtos</h1>";
            break;

        case 'estoque':
            content.innerHTML = "<h1>Estoque atual</h1>";
            break;

        case 'remover':
            content.innerHTML = "<h1>Remover Produtos</h1>";
            break;

        case 'atualizar':
            content.innerHTML = "<h1>Atualizar Produtos</h1>";
            break;

        case 'buscarNome':
            content.innerHTML = "<h1>Buscar por Nome</h1>";
            break;

        case 'buscarCodigo':
            content.innerHTML = "<h1>Buscar por Código</h1>";
            break;

        default:
            content.innerHTML = "<h1>Bem-vindo</h1>";
    }
}

function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("close");
}