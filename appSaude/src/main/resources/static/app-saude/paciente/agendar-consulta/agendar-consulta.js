// paciente/agendar-consulta/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { medicoService } from "../../recursos/chamadaBackEnd/medicoService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";
import { montarCalendarioSemana } from "../../recursos/js/weekCalendar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const params = new URLSearchParams(window.location.search);
const editandoId = params.get("id");
const horarioInput = document.querySelector("#horario");
const horariosManha = document.querySelector("#horarios-manha");
const horariosTarde = document.querySelector("#horarios-tarde");

const opcoesManha = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const opcoesTarde = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

const especialidadeParam = params.get("especialidade");
if (especialidadeParam) {
    const select = document.querySelector("#especialidade");
    if ([...select.options].some((o) => o.value === especialidadeParam)) {
        select.value = especialidadeParam;
    }
}

if (editandoId) {
    document.querySelector("#data").value = params.get("data") ?? "";
    horarioInput.value = (params.get("horario") ?? "").slice(0, 5);
    document.querySelector("#observacao").value = params.get("observacao") ?? "";

    document.querySelector("#pagina-titulo").textContent = "Editar consulta";
    document.querySelector("#pagina-subtitulo").textContent =
        "Altere a data, o horário ou a observação da sua consulta.";
    document.querySelector("#btn-solicitar").innerHTML =
        `<i class="fa-regular fa-floppy-disk"></i> Salvar alterações`;
}

const calendarioData = montarCalendarioSemana({
    input: document.querySelector("#data"),
    dias: document.querySelector("#calendario-dias"),
    titulo: document.querySelector("#calendario-mes"),
    anterior: document.querySelector("#calendario-anterior"),
    proximo: document.querySelector("#calendario-proximo"),
    hoje: document.querySelector("#calendario-hoje"),
    permitirDatasPassadas: false,
});

function renderizarHorarios() {
    const horarioAtual = horarioInput.value;
    const manha = [...opcoesManha];
    const tarde = [...opcoesTarde];

    if (editandoId && horarioAtual && ![...manha, ...tarde].includes(horarioAtual)) {
        (horarioAtual < "12:00" ? manha : tarde).push(horarioAtual);
    }

    horariosManha.replaceChildren();
    horariosTarde.replaceChildren();

    for (const [container, opcoes] of [[horariosManha, manha], [horariosTarde, tarde]]) {
        opcoes.sort();
        for (const horario of opcoes) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "horario-opcao";
            botao.textContent = horario;
            botao.dataset.horario = horario;
            botao.setAttribute("aria-pressed", String(horario === horarioAtual));
            botao.addEventListener("click", () => {
                horarioInput.value = horario;
                renderizarHorarios();
            });
            container.append(botao);
        }
    }
}

renderizarHorarios();

const form = document.querySelector("#form-agendar");
const btnSolicitar = document.querySelector("#btn-solicitar");
const mensagem = document.querySelector("#mensagem-agendamento");

async function carregarMedicos() {
    const select = document.querySelector("#medico");
    const especialidade = document.querySelector("#especialidade");
    const atualizar = async () => {
        const selecionado = select.value;
        select.replaceChildren(new Option("Selecione o médico", ""));
        try {
            const medicos = await medicoService.listar(especialidade.value);
            for (const medico of medicos) {
                select.add(new Option(`${medico.nome} · ${medico.especialidade ?? ""}`, medico.id));
            }
            if ([...select.options].some((option) => option.value === selecionado)) select.value = selecionado;
            const medicoParam = params.get("medicoId");
            if (editandoId && medicoParam && [...select.options].some((option) => option.value === medicoParam)) {
                select.value = medicoParam;
            }
        } catch (error) {
            mostrarMensagem(error.message || "Não foi possível carregar os médicos.", true);
        }
    };
    especialidade.addEventListener("change", atualizar);
    await atualizar();
}

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    mensagem.classList.toggle("estado--erro", erro);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!usuario?.id) {
        mostrarMensagem("Não foi possível identificar o paciente logado.", true);
        return;
    }

    if (!horarioInput.value) {
        mostrarMensagem("Selecione um horário para a consulta.", true);
        document.querySelector(".horario-opcao")?.focus();
        return;
    }

    const dto = {
        medicoId: Number(document.querySelector("#medico").value),
        data: document.querySelector("#data").value,
        hora: document.querySelector("#horario").value,
        observacoes: document.querySelector("#observacao").value.trim(),
    };

    btnSolicitar.disabled = true;
    mensagem.style.display = "none";

    try {
        if (editandoId) {
            await consultaService.atualizar(editandoId, dto);
            mostrarMensagem("Consulta atualizada com sucesso!");
        } else {
            await consultaService.criar(dto);
            mostrarMensagem("Consulta solicitada com sucesso! Você será notificado quando for confirmada.");
            const dataSelecionada = calendarioData.obterData();
            form.reset();
            calendarioData.definirData(dataSelecionada, false);
            renderizarHorarios();
        }
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível salvar a consulta.", true);
    } finally {
        btnSolicitar.disabled = false;
    }
});

carregarMedicos();
