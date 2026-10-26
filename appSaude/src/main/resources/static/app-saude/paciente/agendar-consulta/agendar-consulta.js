// paciente/agendar-consulta/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { medicoService } from "../../recursos/chamadaBackEnd/medicoService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout")?.addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const params = new URLSearchParams(window.location.search);
const editandoId = params.get("id");
const inputData = document.querySelector("#data");
const inputHorario = document.querySelector("#horario");
const diasSemana = document.querySelector("#dias-semana");
const mesAtual = document.querySelector("#mes-atual");
const hojeISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
const horarios = [
    { container: document.querySelector("#horarios-manha"), valores: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
    { container: document.querySelector("#horarios-tarde"), valores: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"] },
];

function dataLocal(iso) {
    const [ano, mes, dia] = iso.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function isoLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function renderizarSemana(dataSelecionada) {
    const inicio = dataLocal(dataSelecionada);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    mesAtual.textContent = inicio.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    diasSemana.replaceChildren();

    for (let indice = 0; indice < 7; indice += 1) {
        const dia = new Date(inicio);
        dia.setDate(inicio.getDate() + indice);
        const valor = isoLocal(dia);
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "day-button";
        botao.setAttribute("aria-pressed", String(valor === inputData.value));
        botao.disabled = !editandoId && valor < hojeISO;
        botao.innerHTML = `<span>${dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span><strong>${dia.getDate()}</strong>`;
        botao.addEventListener("click", () => {
            inputData.value = valor;
            renderizarSemana(valor);
        });
        diasSemana.append(botao);
    }
}

function renderizarHorarios() {
    for (const grupo of horarios) {
        grupo.container.replaceChildren();
        for (const valor of grupo.valores) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "time-button";
            botao.textContent = valor;
            botao.setAttribute("aria-pressed", String(valor === inputHorario.value));
            botao.addEventListener("click", () => {
                inputHorario.value = valor;
                renderizarHorarios();
            });
            grupo.container.append(botao);
        }
    }
}

document.querySelector("#semana-anterior").addEventListener("click", () => {
    const data = dataLocal(inputData.value || hojeISO);
    data.setDate(data.getDate() - 7);
    renderizarSemana(isoLocal(data));
});

document.querySelector("#proxima-semana").addEventListener("click", () => {
    const data = dataLocal(inputData.value || hojeISO);
    data.setDate(data.getDate() + 7);
    renderizarSemana(isoLocal(data));
});

document.querySelector("#ir-hoje").addEventListener("click", () => {
    inputData.value = hojeISO;
    renderizarSemana(hojeISO);
});

inputData.value = hojeISO;
renderizarSemana(hojeISO);
renderizarHorarios();

const especialidadeParam = params.get("especialidade");
if (especialidadeParam) {
    const select = document.querySelector("#especialidade");
    if ([...select.options].some((o) => o.value === especialidadeParam)) {
        select.value = especialidadeParam;
    }
}

if (editandoId) {
    inputData.value = params.get("data") ?? hojeISO;
    inputHorario.value = params.get("horario") ?? "";
    renderizarSemana(inputData.value);
    renderizarHorarios();
    document.querySelector("#observacao").value = params.get("observacao") ?? "";

    document.querySelector("#pagina-titulo").textContent = "Editar consulta";
    document.querySelector("#pagina-subtitulo").textContent =
        "Altere a data, o horário ou a observação da sua consulta.";
    document.querySelector("#btn-solicitar").innerHTML =
        `<i class="fa-regular fa-floppy-disk"></i> Salvar alterações`;
}

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

    if (!inputData.value || !inputHorario.value) {
        mostrarMensagem("Escolha uma data e um horário para continuar.", true);
        (inputData.value ? document.querySelector("#horarios-manha") : diasSemana).scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    if (!usuario?.id) {
        mostrarMensagem("Não foi possível identificar o paciente logado.", true);
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
            mostrarMensagem("Consulta solicitada com sucesso.");
            form.reset();
            inputData.value = hojeISO;
            inputHorario.value = "";
            renderizarSemana(hojeISO);
            renderizarHorarios();
        }
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível salvar a consulta.", true);
    } finally {
        btnSolicitar.disabled = false;
    }
});

carregarMedicos();
