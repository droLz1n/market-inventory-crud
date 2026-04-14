const ESTADO_MENU_CHAVE = "menu-lateral-expandido";

function atualizarItemAtivo() {
    const caminhoAtual = window.location.pathname.replace(/\/+$/, "") || "/";
    const itensMenu = document.querySelectorAll(".item-menu");

    itensMenu.forEach((item) => {
        item.classList.remove("ativo");

        const link = item.querySelector("a");
        if (!link) {
            return;
        }

        const caminhoLink = new URL(link.getAttribute("href"), window.location.origin).pathname.replace(/\/+$/, "") || "/";

        if (caminhoLink === caminhoAtual) {
            item.classList.add("ativo");
        }
    });
}

function inicializarMenu() {
    const menuSide = document.querySelector(".menu-lateral");
    const btnExp = document.querySelector("#btn-exp");

    if (!menuSide) {
        return;
    }

    const menuExpandido = localStorage.getItem(ESTADO_MENU_CHAVE) === "true";
    menuSide.classList.toggle("expandir", menuExpandido);

    atualizarItemAtivo();

    if (btnExp) {
        btnExp.addEventListener("click", function () {
            menuSide.classList.toggle("expandir");
            localStorage.setItem(ESTADO_MENU_CHAVE, String(menuSide.classList.contains("expandir")));
        });
    }
}
