// paciente/historico/script.js
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

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function renderHistorico(consultas) {
    if (!consultas.length) {
        listaHistorico.innerHTML = `<p class="estado">Nenhum registro no histórico ainda.</p>`;
        return;
    }

    listaHistorico.innerHTML = consultas
        .map(
            (consulta) => `
                <div class="historico-item">
                    <strong>${consulta.status === "REALIZADA" ? "Consulta concluída" : "Retorno realizado"}</strong>
                    <span class="subtitulo">${consulta.especialidade ?? ""} - ${formatarData(consulta.data)}</span>
                    <span class="descricao">${consulta.observacao || "Atendimento finalizado."}</span>
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

    try {
        const consultas = await consultaService.listarPorPaciente(usuario.id);
        const finalizadas = consultas.filter((c) => c.status === "REALIZADA");
        renderHistorico(finalizadas);
    } catch (error) {
        listaHistorico.innerHTML = `<p class="estado estado--erro">${error.message || "Não foi possível carregar o histórico."}</p>`;
    }
}

carregarHistorico();