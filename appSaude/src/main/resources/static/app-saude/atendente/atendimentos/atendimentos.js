// atendente/atendimentos/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";
import { escapeHtml, hojeLocalISO } from "../../recursos/js/seguranca.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario, "Atendente · Recepção");

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

const btnNovoAgendamento = document.querySelector("#btn-novo-agendamento");
btnNovoAgendamento.disabled = true;
btnNovoAgendamento.title = "Agendamento manual pela recepção ainda não está disponível.";

let consultasCarregadas = [];
document.querySelector("#btn-exportar").addEventListener("click", () => {
    if (!consultasCarregadas.length) return;
    const csvCell = (value) => {
        let text = String(value ?? "");
        if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
    };
    const rows = [
        ["Data", "Hora", "Paciente", "Médico", "Especialidade", "Status"],
        ...consultasCarregadas.map(c => [c.data, c.hora, c.pacienteNome, c.medicoNome, c.especialidade, c.status])
    ];
    const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "agenda-consultas.csv";
    a.click();
    URL.revokeObjectURL(url);
});

const filtroData = document.querySelector("#filtro-data");
const filtroPaciente = document.querySelector("#filtro-paciente");
const filtroSituacao = document.querySelector("#filtro-situacao");
const listaAtendimentos = document.querySelector("#lista-atendimentos");
const tituloAgenda = document.querySelector("#titulo-agenda");

const statTotal = document.querySelector("#stat-total");
const statAgendadas = document.querySelector("#stat-agendadas");
const statProximo = document.querySelector("#stat-proximo");

filtroData.value = hojeLocalISO();

function formatarDataLonga(dataISO) {
    if (!dataISO) return "";
    const data = new Date(`${dataISO}T00:00:00`);
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function classesPill(status) {
    const mapa = {
        AGENDADA: { classe: "pill--agendado", texto: "Agendado", linha: "" },
        CONFIRMADA: { classe: "pill--confirmado", texto: "Confirmado", linha: "row--confirmado" },
        REALIZADA: { classe: "pill--finalizado", texto: "Finalizado", linha: "row--finalizado" },
        CANCELADA: { classe: "pill--cancelado", texto: "Cancelado", linha: "row--cancelado" },
    };
    return mapa[status] || { classe: "pill--agendado", texto: status, linha: "" };
}

function renderLista(consultas) {
    if (!consultas.length) {
        listaAtendimentos.innerHTML = `<p class="estado">Nenhum atendimento encontrado para esse filtro.</p>`;
        return;
    }

    listaAtendimentos.innerHTML = consultas
        .map((consulta) => {
            const pill = classesPill(consulta.status);
            return `
                <a class="row ${pill.linha}" href="../detalhes-consulta-atendente/detalhes-consulta-atendente.html?id=${encodeURIComponent(consulta.id)}">
                    <span class="horario">${escapeHtml(consulta.hora)}</span>
                    <span class="quem">
                        <strong>${escapeHtml(consulta.pacienteNome ?? "Paciente")}</strong>
                        <span>${escapeHtml(consulta.medicoNome ?? "Médico")}</span>
                    </span>
                    <span class="pill ${pill.classe}">${pill.texto}</span>
                    <span class="seta">›</span>
                </a>
            `;
        })
        .join("");
}

async function carregar() {
    listaAtendimentos.innerHTML = `<div class="estado">Carregando atendimentos...</div>`;
    tituloAgenda.textContent = `Agenda de ${formatarDataLonga(filtroData.value)}`;

    try {
        const consultas = await consultaService.listarTodas({
            data: filtroData.value,
            paciente: filtroPaciente.value.trim(),
            status: filtroSituacao.value,
        });

        consultasCarregadas = consultas;
        statTotal.textContent = consultas.length;
        statAgendadas.textContent = consultas.filter((c) => c.status !== "CANCELADA" && c.status !== "REALIZADA").length;
        statProximo.textContent = consultas[0]?.hora ?? "--:--";

        renderLista(consultas);
    } catch (error) {
        listaAtendimentos.textContent = error.message || "Não foi possível carregar os atendimentos.";
    }
}

filtroData.addEventListener("change", carregar);
filtroSituacao.addEventListener("change", carregar);
filtroPaciente.addEventListener("input", () => {
    clearTimeout(filtroPaciente._t);
    filtroPaciente._t = setTimeout(carregar, 400);
});

carregar();
