// atendente/atendimentos/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";
import { escapeHtml, hojeLocalISO } from "../../recursos/js/seguranca.js";
import { montarCalendarioSemana } from "../../recursos/js/weekCalendar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario, "Atendente · Recepção");

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

document.querySelector("#btn-exportar").addEventListener("click", () => {
    alert("Exportação de lista ainda não foi implementada.");
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

montarCalendarioSemana({
    input: filtroData,
    dias: document.querySelector("#calendario-dias"),
    titulo: document.querySelector("#calendario-mes"),
    anterior: document.querySelector("#calendario-anterior"),
    proximo: document.querySelector("#calendario-proximo"),
    hoje: document.querySelector("#calendario-hoje"),
    permitirDatasPassadas: true,
});

carregar();
