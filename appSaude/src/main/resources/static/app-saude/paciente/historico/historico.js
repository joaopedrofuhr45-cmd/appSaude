// paciente/historico/login.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const listaHistorico = document.querySelector("#lista-historico");
const filtroStatus = document.querySelector("#filtro-status");

const TITULOS_POR_STATUS = {
    REALIZADA: "Consulta concluída",
    PENDENTE: "Consulta pendente",
    CONFIRMADA: "Consulta confirmada",
    CANCELADA: "Consulta cancelada",
};

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function renderHistorico(consultas, status) {
    if (!consultas.length) {
        listaHistorico.innerHTML = `<p class="estado">Nenhum registro com esse status.</p>`;
        return;
    }

    listaHistorico.innerHTML = consultas
        .map(
            (consulta) => `
                <div class="historico-item">
                    <strong>${TITULOS_POR_STATUS[status] ?? "Consulta"}</strong>
                    <span class="subtitulo">${consulta.especialidade ?? ""} - ${formatarData(consulta.data)}</span>
                    <span class="descricao">${consulta.observacao || "Sem observações registradas."}</span>
                </div>
            `
        )
        .join("");
}

async function carregarHistorico() {
    if (!usuario?.id) {
        listaHistorico.innerHTML = `<p class="estado estado--erro">Não foi possível identificar o paciente logado.</p>`;
        return;
    }

    const status = filtroStatus.value;
    listaHistorico.innerHTML = `<div class="estado">Carregando histórico...</div>`;

    try {
        const consultas = await consultaService.listarPorStatus(usuario.id, status);
        renderHistorico(consultas, status);
    } catch (error) {
        listaHistorico.innerHTML = `<p class="estado estado--erro">${error.message || "Não foi possível carregar o histórico."}</p>`;
    }
}

filtroStatus.addEventListener("change", carregarHistorico);

carregarHistorico();