// paciente/inicio/script.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { pacienteService } from "../../recursos/chamadaBackEnd/pacienteService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

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

function badgeStatus(status) {
    const mapa = {
        CONFIRMADA: { classe: "badge--confirmada", texto: "Confirmada" },
        PENDENTE: { classe: "badge--pendente", texto: "Pendente" },
        CANCELADA: { classe: "badge--cancelada", texto: "Cancelada" },
    };
    return mapa[status] || { classe: "badge--pendente", texto: status || "Pendente" };
}

function renderProximaConsulta(consulta) {
    if (!consulta) {
        proximaConsultaCard.innerHTML = `<p class="estado">Nenhuma consulta agendada no momento.</p>`;
        return;
    }

    proximaConsultaCard.innerHTML = `
        <div class="titulo"><i class="fa-regular fa-calendar"></i> Próxima consulta</div>
        <p class="especialidade">${consulta.especialidade ?? ""}</p>
        <p class="detalhes">${formatarData(consulta.data)}, às ${consulta.horario ?? ""} com ${consulta.medico ?? "profissional a definir"}.</p>
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
            return `
                <div class="consulta-item">
                    <p class="horario">${consulta.horario ?? ""}</p>
                    <div class="info">
                        <strong>${consulta.medico ?? "Profissional a definir"}</strong>
                        <span>${consulta.especialidade ?? ""} - ${formatarData(consulta.data)}${consulta.local ? ` - ${consulta.local}` : ""}</span>
                    </div>
                    <span class="badge ${badge.classe}">${badge.texto}</span>
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

        const futuras = consultas.filter((c) => c.status !== "CANCELADA");
        const realizadas = consultas.filter((c) => c.status === "REALIZADA");

        statMarcadas.textContent = futuras.length;
        statRealizados.textContent = realizadas.length;
        statProximoHorario.textContent = futuras[0]?.horario ?? "--:--";

        renderProximaConsulta(futuras[0]);
        renderListaConsultas(futuras);
    } catch (error) {
        proximaConsultaCard.innerHTML = `<p class="estado estado--erro">Não foi possível carregar suas consultas.</p>`;
        listaProximasConsultas.innerHTML = `<p class="estado estado--erro">${error.message || "Erro ao buscar consultas."}</p>`;
    }

    try {
        const perfil = await pacienteService.getPerfil(usuario.id);
        const completo = Boolean(perfil?.nome && perfil?.cpf && perfil?.telefone);
        statCadastro.textContent = completo ? "OK" : "Pendente";
    } catch {
        statCadastro.textContent = "--";
    }
}

btnLogout.addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

carregarDashboard();