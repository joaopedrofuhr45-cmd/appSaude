// medico/detalhes-consulta-medico/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

const consultaId = new URLSearchParams(window.location.search).get("id");

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function pillSituacao(status) {
    const mapa = {
        PENDENTE: { classe: "pill--agendado", texto: "Agendado" },
        CONFIRMADA: { classe: "pill--confirmado", texto: "Confirmada" },
        REALIZADA: { classe: "pill--finalizado", texto: "Finalizada" },
        CANCELADA: { classe: "pill--cancelado", texto: "Cancelada" },
    };
    return mapa[status] || { classe: "pill--agendado", texto: status ?? "" };
}

async function carregar() {
    if (!consultaId) {
        document.querySelector("#subtitulo-consulta").textContent = "Consulta não informada.";
        return;
    }

    try {
        const consulta = await consultaService.getById(consultaId);

        document.querySelector("#subtitulo-consulta").textContent =
            `Consulta de ${formatarData(consulta.data)}, às ${consulta.horario ?? ""}.`;

        document.querySelector("#info-paciente").textContent = consulta.paciente ?? "–";
        document.querySelector("#info-medico").textContent = consulta.medico ?? "–";
        document.querySelector("#info-especialidade").textContent = consulta.especialidade ?? "–";
        document.querySelector("#info-data-hora").textContent =
            `${formatarData(consulta.data)} às ${consulta.horario ?? ""}`;
        document.querySelector("#info-convenio").textContent = consulta.convenio ?? "Particular";

        const pill = pillSituacao(consulta.status);
        const situacaoEl = document.querySelector("#info-situacao");
        situacaoEl.textContent = pill.texto;
        situacaoEl.className = `pill ${pill.classe}`;

        document.querySelector("#info-observacao").textContent =
            consulta.observacao || "Nenhuma observação registrada.";

        document.querySelector("#pessoa-nome").textContent = consulta.paciente ?? "–";
        document.querySelector("#pessoa-sub").textContent = consulta.pacienteIdade
            ? `${consulta.pacienteIdade} anos`
            : "";
        document.querySelector("#mini-convenio").textContent = consulta.convenio ?? "Particular";
        document.querySelector("#mini-tipo").textContent = consulta.tipoConsulta ?? "Consulta";
        document.querySelector("#mini-unidade").textContent = consulta.local ?? "–";

        if (consulta.status === "CANCELADA" || consulta.status === "REALIZADA") {
            document.querySelector("#btn-cancelar").disabled = true;
        }
    } catch (error) {
        document.querySelector("#subtitulo-consulta").textContent =
            error.message || "Não foi possível carregar a consulta.";
    }
}

document.querySelector("#btn-cancelar").addEventListener("click", async () => {
    if (!confirm("Tem certeza que deseja cancelar essa consulta?")) return;

    try {
        await consultaService.cancelar(consultaId);
        window.location.href = "../consultas-do-dia/consultas-do-dia.html";
    } catch (error) {
        alert(error.message || "Não foi possível cancelar a consulta.");
    }
});
document.querySelector("#btn-iniciar-atendimento").addEventListener("click", () => {
    window.location.href = `../atendimentos/atendimentos.html`;
});
carregar();