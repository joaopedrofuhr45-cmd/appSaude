import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";
import { escapeHtml } from "../../recursos/js/seguranca.js";

const usuario = authService.getUsuarioLogado();
const listaHistorico = document.querySelector("#lista-historico");
const filtroStatus = document.querySelector("#filtro-status");

preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const TITULOS_POR_STATUS = {
    REALIZADA: "Consulta concluída",
    AGENDADA: "Consulta pendente",
    CONFIRMADA: "Consulta confirmada",
    CANCELADA: "Consulta cancelada",
};

const MENSAGENS_VAZIAS_POR_STATUS = {
    "": "Nenhuma consulta registrada.",
    REALIZADA: "Não há consultas concluídas.",
    AGENDADA: "Não há consultas pendentes.",
    CONFIRMADA: "Não há consultas confirmadas.",
    CANCELADA: "Não há consultas canceladas.",
};

let requisicaoAtual = 0;

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return dia + "/" + mes + "/" + ano;
}

function formatarHorario(hora) {
    return hora ? String(hora).slice(0, 5) : "--:--";
}

function tituloStatus(status) {
    return TITULOS_POR_STATUS[status] ?? "Consulta";
}

function renderConsultas(consultas, status) {
    if (!consultas.length) {
        listaHistorico.innerHTML = '<p class="estado">' +
            escapeHtml(MENSAGENS_VAZIAS_POR_STATUS[status] ?? "Nenhuma consulta registrada.") +
            "</p>";
        return;
    }

    listaHistorico.innerHTML = consultas
        .slice()
        .sort((a, b) => (b.data + "T" + (b.hora ?? "")).localeCompare(a.data + "T" + (a.hora ?? "")))
        .map((consulta) => [
            '<article class="historico-item">',
            "<strong>" + escapeHtml(tituloStatus(consulta.status)) + "</strong>",
            '<span class="subtitulo">' + escapeHtml(consulta.especialidade) + " - " +
                formatarData(consulta.data) + " às " + escapeHtml(formatarHorario(consulta.hora)) + "</span>",
            '<span class="descricao">' +
                escapeHtml(consulta.observacoes || "Sem observações registradas.") + "</span>",
            "</article>",
        ].join(""))
        .join("");
}

async function carregarHistorico() {
    if (!usuario?.id) {
        listaHistorico.innerHTML =
            '<p class="estado estado--erro">Não foi possível identificar o paciente logado.</p>';
        return;
    }

    const numeroRequisicao = ++requisicaoAtual;
    const status = filtroStatus.value;

    listaHistorico.innerHTML = '<div class="estado">Carregando consultas...</div>';

    try {
        const consultas = await consultaService.listarPorStatus(usuario.id, status);
        if (numeroRequisicao !== requisicaoAtual) return;
        renderConsultas(consultas, status);
    } catch (error) {
        if (numeroRequisicao !== requisicaoAtual) return;
        listaHistorico.innerHTML = '<p class="estado estado--erro">' +
            escapeHtml(error.message || "Não foi possível carregar o histórico.") +
            "</p>";
    }
}

filtroStatus.addEventListener("change", carregarHistorico);
carregarHistorico();
