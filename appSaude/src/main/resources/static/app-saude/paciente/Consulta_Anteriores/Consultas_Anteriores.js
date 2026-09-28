// paciente/consultas-anteriores/consultas-anteriores.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const formFiltros = document.querySelector("#form-filtros");
const campoBusca = document.querySelector("#busca");
const filtroPeriodo = document.querySelector("#periodo");
const filtroSituacao = document.querySelector("#situacao");
const totalConsultas = document.querySelector("#total-consultas");
const listaConsultas = document.querySelector("#lista-consultas");
const btnBaixar = document.querySelector("#btn-baixar");

// "Consultas anteriores" = consultas que já foram realizadas ou canceladas.
const STATUS_ANTERIORES = ["REALIZADA", "CANCELADA"];

const STATUS_VISUAL = {
    REALIZADA: { classeItem: "status-concluida", classeTag: "tag-concluida", texto: "Concluída" },
    CANCELADA: { classeItem: "status-cancelada", classeTag: "tag-cancelada", texto: "Cancelada" },
};

let consultasAnteriores = [];
let consultasFiltradas = [];

/* ---------- utilitários ---------- */

function escapeHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// minúsculas e sem acento, para a busca ignorar "Clínica" x "clinica"
function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

// "08:00:00" -> "08:00"
function formatarHorario(horario) {
    return horario ? String(horario).slice(0, 5) : "--:--";
}

function dataLimite(meses) {
    const limite = new Date();
    limite.setMonth(limite.getMonth() - meses);
    const ano = limite.getFullYear();
    const mes = String(limite.getMonth() + 1).padStart(2, "0");
    const dia = String(limite.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function ordenarMaisRecentesPrimeiro(a, b) {
    const chaveA = `${a.data ?? ""}T${formatarHorario(a.horario)}`;
    const chaveB = `${b.data ?? ""}T${formatarHorario(b.horario)}`;
    return chaveB.localeCompare(chaveA);
}

/* ---------- filtros ---------- */

function aplicarFiltros() {
    const termo = normalizar(campoBusca.value);
    const meses = Number(filtroPeriodo.value);
    const situacao = filtroSituacao.value;
    const limite = meses > 0 ? dataLimite(meses) : null;

    consultasFiltradas = consultasAnteriores
        .filter((c) => !situacao || c.status === situacao)
        .filter((c) => !limite || (c.data ?? "") >= limite)
        .filter((c) => {
            if (!termo) return true;
            return (
                normalizar(c.medico).includes(termo) ||
                normalizar(c.especialidade).includes(termo)
            );
        })
        .sort(ordenarMaisRecentesPrimeiro);

    renderLista();
}

/* ---------- renderização ---------- */

function renderTotal() {
    const qtd = consultasFiltradas.length;
    totalConsultas.textContent =
        qtd === 1 ? "1 consulta encontrada" : `${qtd} consultas encontradas`;
}

function renderLista() {
    renderTotal();
    btnBaixar.disabled = !consultasFiltradas.length;

    if (!consultasFiltradas.length) {
        listaConsultas.innerHTML = `<li class="estado">Nenhuma consulta encontrada com esses filtros.</li>`;
        return;
    }

    listaConsultas.innerHTML = consultasFiltradas
        .map((consulta) => {
            const visual = STATUS_VISUAL[consulta.status] ?? STATUS_VISUAL.REALIZADA;

            return `
                <li class="consulta-item ${visual.classeItem}">
                    <span class="consulta-hora">${escapeHtml(formatarHorario(consulta.horario))}</span>
                    <div class="consulta-info">
                        <strong>${escapeHtml(consulta.medico ?? "Profissional não informado")}</strong>
                        <span>${escapeHtml(consulta.especialidade ?? "")} · ${formatarData(consulta.data)}</span>
                    </div>
                    <span class="tag-status ${visual.classeTag}">${visual.texto}</span>
                    <i class="fa-solid fa-angle-right seta"></i>
                </li>
            `;
        })
        .join("");
}

/* ---------- baixar histórico (CSV) ---------- */

function baixarHistorico(event) {
    event.preventDefault();
    if (!consultasFiltradas.length) return;

    const cabecalho = ["Data", "Horário", "Médico", "Especialidade", "Situação", "Observação"];
    const linhas = consultasFiltradas.map((c) => [
        formatarData(c.data),
        formatarHorario(c.horario),
        c.medico ?? "",
        c.especialidade ?? "",
        STATUS_VISUAL[c.status]?.texto ?? c.status ?? "",
        c.observacao ?? "",
    ]);

    const csv = [cabecalho, ...linhas]
        .map((linha) => linha.map((celula) => `"${String(celula).replace(/"/g, '""')}"`).join(";"))
        .join("\r\n");

    // BOM no início para o Excel abrir os acentos corretamente
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "historico-consultas.csv";
    link.click();

    URL.revokeObjectURL(url);
}

/* ---------- carregamento ---------- */

async function carregarConsultas() {
    if (!usuario?.id) {
        totalConsultas.textContent = "Consultas anteriores";
        listaConsultas.innerHTML = `<li class="estado estado--erro">Não foi possível identificar o paciente logado.</li>`;
        return;
    }

    listaConsultas.innerHTML = `<li class="estado">Carregando consultas...</li>`;

    try {
        const consultas = await consultaService.listarPorPaciente(usuario.id);
        consultasAnteriores = consultas.filter((c) => STATUS_ANTERIORES.includes(c.status));
        aplicarFiltros();
    } catch (error) {
        totalConsultas.textContent = "Consultas anteriores";
        btnBaixar.disabled = true;
        listaConsultas.innerHTML = `<li class="estado estado--erro">${escapeHtml(error.message || "Não foi possível carregar as consultas.")}</li>`;
    }
}

formFiltros.addEventListener("submit", (event) => event.preventDefault());
campoBusca.addEventListener("input", aplicarFiltros);
filtroPeriodo.addEventListener("change", aplicarFiltros);
filtroSituacao.addEventListener("change", aplicarFiltros);
btnBaixar.addEventListener("click", baixarHistorico);

carregarConsultas();