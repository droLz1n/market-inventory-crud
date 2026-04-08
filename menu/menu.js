// Este script não precisa ser chamado dentro do fetch, 
// ele pode ficar sozinho no seu arquivo menu.js

document.addEventListener('click', function (event) {
    
    // 1. Lógica para Expandir o Menu
    const btnExp = event.target.closest('#btn-exp');
    if (btnExp) {
        const menuSide = document.querySelector('.menu-lateral');
        if (menuSide) {
            menuSide.classList.toggle('expandir');
        }
    }

    // 2. Lógica para selecionar o item ativo
    const itemMenu = event.target.closest('.item-menu');
    if (itemMenu) {
        // Remove 'ativo' de todos os itens
        document.querySelectorAll('.item-menu').forEach(item => {
            item.classList.remove('ativo');
        });
        // Adiciona 'ativo' ao item clicado
        itemMenu.classList.add('ativo');
    }
});