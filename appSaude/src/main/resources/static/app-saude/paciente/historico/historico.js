// paciente/historico/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";
import { escapeHtml } from "../../recursos/js/seguranca.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const listaHistorico = document.querySelector("#lista-historico");

const TITULOS_POR_STATUS = {
    REALIZADA: "Consulta concluída",
    AGENDADA: "Consulta pendente",
    CONFIRMADA: "Consulta confirmada",
    CANCELADA: "Consulta cancelada",
};

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function tituloStatus(status) {
    return TITULOS_POR_STATUS[status] ?? "Consulta";
}

function renderTodasConsultas(consultas) {
    if (!consultas.length) {
        listaHistorico.innerHTML = `<p class="estado">Nenhuma consulta registrada.</p>`;
        return;
    }

    listaHistorico.innerHTML = consultas
        .slice()
        .sort((a, b) => `${b.data ?? ""}T${b.hora ?? ""}`.localeCompare(`${a.data ?? ""}T${a.hora ?? ""}`))
        .map((consulta) => `
            <div class="historico-item">
                <strong>${escapeHtml(tituloStatus(consulta.status))}</strong>
                <span class="subtitulo">${escapeHtml(consulta.especialidade)} - ${formatarData(consulta.data)} às ${escapeHtml(consulta.hora ?? "")}</span>
                <span class="descricao">${escapeHtml(consulta.observacoes || "Sem observações registradas.")}</span>
            </div>
        `)
        .join("");
}

async function carregarHistorico() {
    if (!usuario?.id) {
        listaHistorico.innerHTML = `<p class="estado estado--erro">Não foi possível identificar o paciente logado.</p>`;
        return;
    }

    listaHistorico.innerHTML = `<div class="estado">Carregando histórico...</div>`;

    try {
        const consultas = await consultaService.listarPorPaciente(usuario.id);
        renderTodasConsultas(consultas);
    } catch (error) {
        listaHistorico.textContent = error.message || "Não foi possível carregar o histórico.";
    }
}

carregarHistorico();
