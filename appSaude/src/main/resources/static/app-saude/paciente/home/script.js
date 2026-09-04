import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";

const saudacao = document.getElementById("saudacao");
const listaConsultas = document.getElementById("lista-consultas");

// Protege a rota — sem login, redireciona
if (!authService.isAutenticado()) {
    window.location.href = "../../telas-comuns/login/index.html";
}

const usuario = authService.getUsuarioLogado();
saudacao.textContent = `Olá, ${usuario?.nome ?? "paciente"}!`;

async function carregarProximasConsultas() {
    try {
        const consultas = await consultaService.listarPorPaciente(usuario.id);
        const hoje = new Date().toISOString().split("T")[0];

        const proximas = consultas
            .filter((c) => c.dataConsulta >= hoje)
            .sort((a, b) => a.dataConsulta.localeCompare(b.dataConsulta))
            .slice(0, 3);

        renderizarConsultas(proximas);
    } catch (error) {
        listaConsultas.innerHTML = `<p class="erro-consultas">Não foi possível carregar suas consultas.</p>`;
        console.error(error);
    }
}

function renderizarConsultas(consultas) {
    if (consultas.length === 0) {
        listaConsultas.innerHTML = `<p class="sem-consultas">Nenhuma consulta agendada.</p>`;
        return;
    }

    listaConsultas.innerHTML = consultas
        .map(
            (c) => `
        <a href="../../telas-comuns/detalhes-consulta/index.html?id=${c.idConsulta}">
            <div class="cartao-consulta ${classeStatus(c.statusConsulta)}">
                <div class="horario-consulta">
                    <p>${c.horaConsulta.slice(0, 5)}</p>
                </div>
                <div class="informacoes-consulta">
                    <p class="nome-medico">Dr(a). ${c.medico.nome}</p>
                    <p class="nome-especialidade">${c.medico.especialidadeMedico ?? ""}</p>
                    <div class="status-consulta">
                        <p>${formatarStatus(c.statusConsulta)}</p>
                    </div>
                </div>
                <div class="seta-consulta">
                    <p>&gt;</p>
                </div>
            </div>
        </a>
    `
        )
        .join("");
}

// Verde por padrão (mesma cor que já existe no CSS); só troca se vier "pend" ou "cancel"
function classeStatus(status) {
    const s = (status ?? "").toLowerCase();
    if (s.includes("cancel")) return "status-cancelada";
    if (s.includes("pend")) return "status-pendente";
    return "";
}

// Só capitaliza a primeira letra — mantém o texto igual ao que o backend manda
function formatarStatus(status) {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

carregarProximasConsultas();