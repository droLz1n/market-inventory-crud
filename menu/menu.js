const ESTADO_MENU_CHAVE = "menu-lateral-expandido";
const BREAKPOINT_MOBILE = 640;

function menuEstaNoMobile() {
    return window.innerWidth <= BREAKPOINT_MOBILE;
}

function sincronizarEstadoVisualMenu(menuSide) {
    if (!menuSide) {
        return;
    }

    const menuExpandido = menuSide.classList.contains("expandir");
    document.body.classList.toggle("menu-mobile-aberto", menuEstaNoMobile() && menuExpandido);
}

function fecharMenuMobile(menuSide) {
    if (!menuSide || !menuEstaNoMobile()) {
        return;
    }

    menuSide.classList.remove("expandir");
    sincronizarEstadoVisualMenu(menuSide);
}

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
    const linksMenu = document.querySelectorAll(".item-menu a");

    if (!menuSide) {
        return;
    }

    const menuExpandido = localStorage.getItem(ESTADO_MENU_CHAVE) === "true";
    menuSide.classList.toggle("expandir", menuEstaNoMobile() ? false : menuExpandido);
    sincronizarEstadoVisualMenu(menuSide);

    atualizarItemAtivo();

    if (btnExp) {
        btnExp.addEventListener("click", function () {
            menuSide.classList.toggle("expandir");
            localStorage.setItem(ESTADO_MENU_CHAVE, String(menuSide.classList.contains("expandir")));
            sincronizarEstadoVisualMenu(menuSide);
        });
    }

    linksMenu.forEach((link) => {
        link.addEventListener("click", function () {
            fecharMenuMobile(menuSide);
        });
    });

    document.addEventListener("click", function (event) {
        if (!menuEstaNoMobile() || !menuSide.classList.contains("expandir")) {
            return;
        }

        const cliqueDentroDoMenu = menuSide.contains(event.target);
        if (!cliqueDentroDoMenu) {
            fecharMenuMobile(menuSide);
        }
    });

    window.addEventListener("resize", function () {
        if (menuEstaNoMobile()) {
            menuSide.classList.remove("expandir");
        } else {
            const deveExpandir = localStorage.getItem(ESTADO_MENU_CHAVE) === "true";
            menuSide.classList.toggle("expandir", deveExpandir);
        }

        sincronizarEstadoVisualMenu(menuSide);
    });
}
