// configuracoes/script.js

/* =========================================================
   ELEMENTOS
   ========================================================= */

const opcoes = document.querySelectorAll(".opcao");
const btnSair = document.querySelector(".btn-sair");


/* =========================================================
   CLIQUES NAS OPÇÕES
   ========================================================= */

opcoes.forEach((opcao) => {

    opcao.addEventListener("click", () => {

        const texto = opcao.querySelector(".texto").textContent.trim();

        switch (texto) {

            case "Alterar senha":
                window.location.href = "../alterar-senha/index.html";
                break;

            case "Notificações":
                window.location.href = "../notificacoes/index.html";
                break;

            case "Privacidade":
                window.location.href = "../privacidade/index.html";
                break;

            case "Ajuda e suporte":
                window.location.href = "../ajuda-suporte/index.html";
                break;

        }

    });

});


/* =========================================================
   BOTÃO SAIR
   ========================================================= */

btnSair.addEventListener("click", () => {

    const confirmar = confirm("Deseja realmente sair?");

    if (!confirmar) {
        return;
    }

    /*
     * Caso você tenha uma função de logout no backend,
     * ela deve ser chamada aqui.
     *
     * Exemplo:
     *
     * await authService.logout();
     */

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    window.location.href = "../login/index.html";

});