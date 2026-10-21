// paciente/inicio/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { pacienteService } from "../../recursos/chamadaBackEnd/pacienteService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";
import { escapeHtml } from "../../recursos/js/seguranca.js";

const saudacao = document.querySelector("#saudacao");
const btnLogout = document.querySelector("#btn-logout");

const proximaConsultaCard = document.querySelector("#proxima-consulta-card");
const listaProximasConsultas = document.querySelector("#lista-proximas-consultas");

const statMarcadas = document.querySelector("#stat-marcadas");
const statRealizados = document.querySelector("#stat-realizados");
const statProximoHorario = document.querySelector("#stat-proximo-horario");
const statCadastro = document.querySelector("#stat-cadastro");

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function dataLocalISO() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function badgeStatus(status) {
    const mapa = {
        CONFIRMADA: { classe: "badge--confirmada", texto: "Confirmada" },
        AGENDADA: { classe: "badge--pendente", texto: "Pendente" },
        CANCELADA: { classe: "badge--cancelada", texto: "Cancelada" },
    };
    return mapa[status] || { classe: "badge--pendente", texto: status || "Pendente" };
}

function linkEditar(consulta) {
    const params = new URLSearchParams({
        id: consulta.id,
        medicoId: consulta.medicoId ?? "",
        especialidade: consulta.especialidade ?? "",
        data: consulta.data ?? "",
        horario: consulta.hora ?? "",
        observacao: consulta.observacoes ?? "",
    });
    return `../agendar-consulta/agendar-consulta.html?${params.toString()}`;
}

function renderProximaConsulta(consulta) {
    if (!consulta) {
        proximaConsultaCard.innerHTML = `<p class="estado">Nenhuma consulta agendada no momento.</p>`;
        return;
    }

    proximaConsultaCard.innerHTML = `
        <div class="titulo"><i class="fa-regular fa-calendar"></i> Próxima consulta</div>
        <p class="especialidade">${escapeHtml(consulta.especialidade)}</p>
        <p class="detalhes">${formatarData(consulta.data)}, às ${escapeHtml(consulta.hora)} com ${escapeHtml(consulta.medicoNome ?? "profissional a definir")}.</p>
        <a href="../agendar-consulta/agendar-consulta.html" class="btn-outline">
            Agendar outra <i class="fa-solid fa-arrow-right"></i>
        </a>
    `;
}

function renderListaConsultas(consultas) {
    if (!consultas.length) {
        listaProximasConsultas.innerHTML = `<p class="estado">Você ainda não tem consultas agendadas.</p>`;
        return;
    }

    listaProximasConsultas.innerHTML = consultas
        .slice(0, 3)
        .map((consulta) => {
            const badge = badgeStatus(consulta.status);
            const editavel = consulta.status !== "CANCELADA" && consulta.status !== "REALIZADA";

            return `
                <div class="consulta-item">
                    <p class="horario">${escapeHtml(consulta.hora)}</p>
                    <div class="info">
                        <strong>${escapeHtml(consulta.medicoNome ?? "Profissional a definir")}</strong>
                        <span>${escapeHtml(consulta.especialidade)} - ${formatarData(consulta.data)}</span>
                    </div>
                    <div class="lado-direito">
                        <span class="badge ${badge.classe}">${badge.texto}</span>
                        ${editavel ? `
                            <div class="acoes">
                                <a class="acao-editar" href="${linkEditar(consulta)}">Editar</a>
                                <button type="button" class="acao-cancelar" data-id="${consulta.id}">Cancelar</button>
                            </div>
                        ` : ""}
                    </div>
                </div>
            `;
        })
        .join("");
}

async function carregarDashboard() {
    const usuario = authService.getUsuarioLogado();

    preencherSidebarUsuario(usuario);
    saudacao.textContent = usuario?.nome
        ? `Olá, ${usuario.nome.split(" ")[0]}. Como está sua saúde hoje?`
        : "Olá! Como está sua saúde hoje?";

    if (!usuario?.id) {
        proximaConsultaCard.innerHTML = `<p class="estado estado--erro">Não foi possível identificar o paciente logado.</p>`;
        listaProximasConsultas.innerHTML = "";
        return;
    }

    try {
        const consultas = await consultaService.listarPorPaciente(usuario.id);

        const futuras = consultas
            .filter((c) => c.status !== "CANCELADA" && c.status !== "REALIZADA" && c.data >= dataLocalISO())
            .sort((a, b) => `${a.data ?? ""}T${a.hora ?? ""}`.localeCompare(`${b.data ?? ""}T${b.hora ?? ""}`));
        const realizadas = consultas.filter((c) => c.status === "REALIZADA");

        statMarcadas.textContent = futuras.length;
        statRealizados.textContent = realizadas.length;
        statProximoHorario.textContent = futuras[0]?.hora ?? "--:--";

        renderProximaConsulta(futuras[0]);
        renderListaConsultas(futuras);
    } catch (error) {
        proximaConsultaCard.innerHTML = `<p class="estado estado--erro">Não foi possível carregar suas consultas.</p>`;
        listaProximasConsultas.textContent = error.message || "Erro ao buscar consultas.";
    }

    try {
        const perfil = await pacienteService.getPerfil(usuario.id);
        const completo = Boolean(perfil?.nome && perfil?.cpf && perfil?.telefone);
        statCadastro.textContent = completo ? "OK" : "Pendente";
    } catch {
        statCadastro.textContent = "--";
    }
}

listaProximasConsultas.addEventListener("click", async (event) => {
    const btn = event.target.closest(".acao-cancelar");
    if (!btn) return;

    if (!confirm("Tem certeza que deseja cancelar essa consulta?")) return;

    btn.disabled = true;
    try {
        await consultaService.cancelar(btn.dataset.id);
        carregarDashboard();
    } catch (error) {
        alert(error.message || "Não foi possível cancelar a consulta.");
        btn.disabled = false;
    }
});

btnLogout.addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

carregarDashboard();
