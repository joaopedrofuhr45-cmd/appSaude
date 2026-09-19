// recursos/js/sidebarUsuario.js
// Preenche os dados do paciente na sidebar do dashboard. Não faz chamada de
// backend nenhuma — os dados já vêm da sessão salva pelo authService.

export function preencherSidebarUsuario(usuario) {
    const nomeEl = document.querySelector("#sidebar-nome");
    const desdeEl = document.querySelector("#sidebar-desde");

    if (nomeEl) {
        nomeEl.textContent = usuario?.nome ?? "Paciente";
    }

    if (desdeEl) {
        desdeEl.textContent = usuario?.criadoEm
            ? `Paciente desde ${new Date(usuario.criadoEm).getFullYear()}`
            : "";
    }
}