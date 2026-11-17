import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario, "Atendente · Recepção");
const id = new URLSearchParams(location.search).get("id");
const set = (selector, value) => { document.querySelector(selector).textContent = value ?? "–"; };
const formatarHora = (hora) => String(hora ?? "").slice(0, 5);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

async function carregar() {
    if (!id) {
        set("#subtitulo-consulta", "Consulta não informada.");
        return;
    }
    try {
        const consulta = await consultaService.getById(id);
        const data = consulta.data ? new Date(`${consulta.data}T00:00:00`).toLocaleDateString("pt-BR") : "";
        const hora = formatarHora(consulta.hora);
        set("#subtitulo-consulta", `Consulta de ${data}, às ${hora}.`);
        set("#info-paciente", consulta.pacienteNome);
        set("#info-medico", consulta.medicoNome);
        set("#info-especialidade", consulta.especialidade);
        set("#info-data-hora", `${data} às ${hora}`);
        set("#info-situacao", consulta.status);
        set("#info-observacao", consulta.observacoes || "Nenhuma observação registrada.");
        set("#pessoa-nome", consulta.pacienteNome);
        set("#pessoa-sub", "Paciente");
        set("#mini-tipo", "Consulta");
        set("#mini-unidade", "–");
    } catch (error) {
        set("#subtitulo-consulta", error.message || "Não foi possível carregar a consulta.");
    }
}

carregar();
