// medico/consultas-do-dia/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";
import { escapeHtml, hojeLocalISO } from "../../recursos/js/seguranca.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

const dataAtualEl = document.querySelector("#data-atual");
const hoje = new Date();
dataAtualEl.textContent = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
const hojeISO = hojeLocalISO();

const filtroPaciente = document.querySelector("#filtro-paciente");
const filtroSituacao = document.querySelector("#filtro-situacao");
const listaConsultas = document.querySelector("#lista-consultas");
const tituloLista = document.querySelector("#titulo-lista");
const btnAtualizar = document.querySelector("#btn-atualizar");

function classesPill(status) {
    const mapa = {
        CONFIRMADA: { classe: "pill--confirmado", texto: "Confirmado", linha: "row--confirmado" },
        REALIZADA: { classe: "pill--finalizado", texto: "Finalizado", linha: "row--finalizado" },
        CANCELADA: { classe: "pill--cancelado", texto: "Cancelado", linha: "row--cancelado" },
    };
    return mapa[status] || { classe: "", texto: status || "Consulta", linha: "" };
}

function formatarHora(hora) {
    return hora ? String(hora).slice(0, 5) : "–";
}

function renderLista(consultas) {
    if (!consultas.length) {
        listaConsultas.innerHTML = `<p class="estado">Nenhuma consulta encontrada para esse filtro.</p>`;
        return;
    }

    tituloLista.textContent = consultas.length + " consulta" + (consultas.length === 1 ? "" : "s") + " do dia";

    listaConsultas.innerHTML = consultas
        .map((consulta) => {
            const pill = classesPill(consulta.status);
            return `
                <a class="row ${pill.linha}" href="../detalhes-consulta-medico/detalhes-consulta-medico.html?id=${encodeURIComponent(consulta.id)}">
                    <span class="horario">${escapeHtml(formatarHora(consulta.hora))}</span>
                    <span class="quem">
                        <strong>${escapeHtml(consulta.pacienteNome ?? "Paciente")}</strong>
                        <span>${escapeHtml(consulta.especialidade)}</span>
                    </span>
                    <span class="pill ${pill.classe}">${pill.texto}</span>
                    <span class="seta">›</span>
                </a>
            `;
        })
        .join("");
}

async function carregar() {
    if (!usuario?.id) {
        listaConsultas.innerHTML = `<p class="estado estado--erro">Não foi possível identificar o médico logado.</p>`;
        return;
    }

    try {
        const consultas = await consultaService.listarPorMedico(
            usuario.id, hojeISO, filtroPaciente.value.trim(), filtroSituacao.value
        );
        renderLista(consultas);
    } catch (error) {
        listaConsultas.textContent = error.message || "Não foi possível carregar as consultas.";
    }
}

filtroSituacao.addEventListener("change", carregar);
filtroPaciente.addEventListener("input", () => {
    clearTimeout(filtroPaciente._t);
    filtroPaciente._t = setTimeout(carregar, 400);
});
btnAtualizar.addEventListener("click", carregar);

carregar();
