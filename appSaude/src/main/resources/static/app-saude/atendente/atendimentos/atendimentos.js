// atendente/atendimentos/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario, "Atendente · Recepção");

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

document.querySelector("#btn-novo-agendamento").addEventListener("click", () => {
    alert("Agendamento manual pelo atendente ainda não foi implementado.");
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

filtroData.value = new Date().toISOString().slice(0, 10);

function formatarDataLonga(dataISO) {
    if (!dataISO) return "";
    const data = new Date(`${dataISO}T00:00:00`);
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function classesPill(status) {
    const mapa = {
        PENDENTE: { classe: "pill--agendado", texto: "Agendado", linha: "" },
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
                <a class="row ${pill.linha}" href="../../medico/detalhes-consulta-medico/index.html?id=${consulta.id}">
                    <span class="horario">${consulta.horario ?? ""}</span>
                    <span class="quem">
                        <strong>${consulta.paciente ?? "Paciente"}</strong>
                        <span>${consulta.especialidade ?? ""} · ${consulta.medico ?? ""}</span>
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
        statProximo.textContent = consultas[0]?.horario ?? "--:--";

        renderLista(consultas);
    } catch (error) {
        listaAtendimentos.innerHTML = `<p class="estado estado--erro">${error.message || "Não foi possível carregar os atendimentos."}</p>`;
    }
}

filtroData.addEventListener("change", carregar);
filtroSituacao.addEventListener("change", carregar);
filtroPaciente.addEventListener("input", () => {
    clearTimeout(filtroPaciente._t);
    filtroPaciente._t = setTimeout(carregar, 400);
});

carregar();