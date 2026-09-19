// recursos/js/staffSidebar.js
// Preenche nome + subtítulo na sidebar de Atendente/Médico. Não chama
// backend nenhum — só usa o que já veio na sessão salva pelo authService.

export function preencherSidebarStaff(usuario, subtituloFallback = "") {
    const nomeEl = document.querySelector("#sidebar-nome");
    const subtituloEl = document.querySelector("#sidebar-subtitulo");

    if (nomeEl) {
        nomeEl.textContent = usuario?.nome ?? "Usuário";
    }

    if (subtituloEl) {
        subtituloEl.textContent = usuario?.especialidade || subtituloFallback;
    }
}