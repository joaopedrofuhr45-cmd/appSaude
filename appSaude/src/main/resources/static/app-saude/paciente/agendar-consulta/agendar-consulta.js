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
const medicoOriginal = params.get("medicoId") ?? "";
const dataOriginal = params.get("data") ?? "";
const horarioOriginal = (params.get("horario") ?? "").slice(0, 5);
const inputData = document.querySelector("#data");
const inputHorario = document.querySelector("#horario");
const diasSemana = document.querySelector("#dias-semana");
const mesAtual = document.querySelector("#mes-atual");
const selectMedico = document.querySelector("#medico");
const selectEspecialidade = document.querySelector("#especialidade");
const form = document.querySelector("#form-agendar");
const btnSolicitar = document.querySelector("#btn-solicitar");
const mensagem = document.querySelector("#mensagem-agendamento");
const hojeISO = isoLocal(new Date());
const horarios = [
    { container: document.querySelector("#horarios-manha"), valores: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
    { container: document.querySelector("#horarios-tarde"), valores: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"] },
];
let horariosOcupados = new Set();
let requestHorarios = 0;
let horariosCarregando = false;
let semanaVisivel = null;

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
function inicioDaSemana(data) {
    const inicio = new Date(data);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    inicio.setHours(0, 0, 0, 0);
    return inicio;
}
function horarioJaPassou(data, hora) {
    if (data !== isoLocal(new Date())) return false;
    const [h, m] = hora.split(":").map(Number);
    const agora = new Date();
    return h * 60 + m <= agora.getHours() * 60 + agora.getMinutes();
}
function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    mensagem.classList.toggle("estado--erro", erro);
}
function renderizarSemana(dataSelecionada) {
    const selecionada = dataSelecionada >= hojeISO ? dataSelecionada : hojeISO;
    const inicio = inicioDaSemana(dataLocal(selecionada));
    const inicioSemanaAtual = inicioDaSemana(dataLocal(hojeISO));
    semanaVisivel = inicio;
    mesAtual.textContent = inicio.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    diasSemana.replaceChildren();
    document.querySelector("#semana-anterior").disabled = inicio.getTime() <= inicioSemanaAtual.getTime();

    for (let indice = 0; indice < 7; indice += 1) {
        const dia = new Date(inicio);
        dia.setDate(inicio.getDate() + indice);
        const valor = isoLocal(dia);
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "day-button";
        botao.setAttribute("aria-pressed", String(valor === inputData.value));
        botao.disabled = valor < hojeISO;
        botao.innerHTML = `<span>${dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span><strong>${dia.getDate()}</strong>`;
        botao.addEventListener("click", () => {
            if (botao.disabled) return;
            inputData.value = valor;
            inputHorario.value = "";
            renderizarSemana(valor);
            atualizarHorarios();
        });
        diasSemana.append(botao);
    }
}
function renderizarHorarios() {
    const medicoId = selectMedico.value;
    for (const grupo of horarios) {
        grupo.container.replaceChildren();
        for (const valor of grupo.valores) {
            const ocupado = horariosOcupados.has(valor);
            const passado = horarioJaPassou(inputData.value, valor);
            const consultaAtual = Boolean(editandoId && medicoId === medicoOriginal && inputData.value === dataOriginal && valor === horarioOriginal);
            const selecionado = inputHorario.value === valor;
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = `time-button${consultaAtual ? " is-current" : ""}${passado ? " is-past" : ""}${ocupado && !consultaAtual ? " is-unavailable" : ""}`;
            botao.textContent = valor;
            botao.setAttribute("aria-pressed", String(selecionado));
            botao.setAttribute("aria-label", consultaAtual ? `${valor}, horário atual da consulta em edição` : passado ? `${valor}, horário já passou` : ocupado ? `${valor}, horário indisponível` : valor);
            if (consultaAtual) botao.title = "Horário da consulta que está sendo editada";
            botao.disabled = horariosCarregando || passado || (ocupado && !consultaAtual) || !medicoId || !inputData.value;
            botao.addEventListener("click", () => {
                if (botao.disabled) return;
                inputHorario.value = valor;
                renderizarHorarios();
            });
            grupo.container.append(botao);
        }
    }
}
async function atualizarHorarios() {
    const requisicao = ++requestHorarios;
    horariosOcupados = new Set();
    horariosCarregando = false;
    if (!inputData.value || !selectMedico.value) {
        renderizarHorarios();
        return;
    }
    horariosCarregando = true;
    renderizarHorarios();
    try {
        const ocupados = await consultaService.horariosIndisponiveis(selectMedico.value, inputData.value);
        if (requisicao !== requestHorarios) return;
        horariosOcupados = new Set(ocupados.map((hora) => String(hora).slice(0, 5)));
        horariosCarregando = false;
        renderizarHorarios();
    } catch (error) {
        if (requisicao !== requestHorarios) return;
        horariosCarregando = false;
        horariosOcupados = new Set(horarios.flatMap((grupo) => grupo.valores));
        renderizarHorarios();
        mostrarMensagem(error.message || "Não foi possível carregar os horários.", true);
    }
}

const especialidadeParam = params.get("especialidade");
if (especialidadeParam && [...selectEspecialidade.options].some((option) => option.value === especialidadeParam)) {
    selectEspecialidade.value = especialidadeParam;
}
if (editandoId) {
    document.querySelector("#pagina-titulo").textContent = "Editar consulta";
    document.querySelector("#pagina-subtitulo").textContent = "Altere a data, o horário ou a observação da sua consulta.";
    btnSolicitar.innerHTML = '<i class="fa-regular fa-floppy-disk" aria-hidden="true"></i> Salvar alterações';
    document.querySelector("#observacao").value = params.get("observacao") ?? "";
}
inputData.value = editandoId && dataOriginal >= hojeISO ? dataOriginal : hojeISO;
inputHorario.value = editandoId && inputData.value === dataOriginal ? horarioOriginal : "";
renderizarSemana(inputData.value);
renderizarHorarios();

async function carregarMedicos() {
    selectMedico.replaceChildren(new Option("Selecione o médico", ""));
    if (!selectEspecialidade.value) {
        inputHorario.value = "";
        await atualizarHorarios();
        return;
    }
    try {
        const medicos = await medicoService.listar(selectEspecialidade.value);
        medicos.forEach((medico) => selectMedico.add(new Option(`${medico.nome} · ${medico.especialidade ?? ""}`, medico.id)));
        if (editandoId && [...selectMedico.options].some((option) => option.value === medicoOriginal)) {
            selectMedico.value = medicoOriginal;
        }
        await atualizarHorarios();
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível carregar os médicos.", true);
    }
}

selectEspecialidade.addEventListener("change", () => {
    selectMedico.replaceChildren(new Option("Selecione o médico", ""));
    inputHorario.value = "";
    carregarMedicos();
});
selectMedico.addEventListener("change", () => {
    const manterAtual = editandoId && selectMedico.value === medicoOriginal && inputData.value === dataOriginal;
    inputHorario.value = manterAtual ? horarioOriginal : "";
    atualizarHorarios();
});
document.querySelector("#semana-anterior").addEventListener("click", () => {
    if (document.querySelector("#semana-anterior").disabled) return;
    const data = new Date(semanaVisivel || inicioDaSemana(dataLocal(hojeISO)));
    data.setDate(data.getDate() - 7);
    renderizarSemana(isoLocal(data));
});
document.querySelector("#proxima-semana").addEventListener("click", () => {
    const data = new Date(semanaVisivel || inicioDaSemana(dataLocal(hojeISO)));
    data.setDate(data.getDate() + 7);
    renderizarSemana(isoLocal(data));
});
document.querySelector("#ir-hoje").addEventListener("click", () => {
    inputData.value = hojeISO;
    inputHorario.value = "";
    renderizarSemana(hojeISO);
    atualizarHorarios();
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!usuario?.id) {
        mostrarMensagem("Não foi possível identificar o paciente logado.", true);
        return;
    }
    const dto = {
        medicoId: Number(selectMedico.value),
        data: inputData.value,
        hora: inputHorario.value,
        observacoes: document.querySelector("#observacao").value.trim(),
    };
    const mantendoHorario = editandoId && String(dto.medicoId) === medicoOriginal && dto.data === dataOriginal && dto.hora === horarioOriginal;
    if (horariosCarregando || !dto.medicoId || !dto.data || !dto.hora || horarioJaPassou(dto.data, dto.hora) || (horariosOcupados.has(dto.hora) && !mantendoHorario)) {
        mostrarMensagem("Selecione um médico, uma data e um horário disponível.", true);
        return;
    }

    btnSolicitar.disabled = true;
    const textoOriginal = btnSolicitar.innerHTML;
    btnSolicitar.textContent = editandoId ? "Salvando alterações..." : "Agendando consulta...";
    mensagem.style.display = "none";
    try {
        if (editandoId) {
            await consultaService.atualizar(editandoId, dto);
            mostrarMensagem("Consulta atualizada com sucesso!");
        } else {
            await consultaService.criar(dto);
            mostrarMensagem("Consulta solicitada com sucesso. Você será notificado quando for confirmada.");
            form.reset();
            inputData.value = hojeISO;
            inputHorario.value = "";
            renderizarSemana(hojeISO);
            horariosOcupados.clear();
            renderizarHorarios();
            atualizarHorarios();
        }
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível salvar a consulta.", true);
    } finally {
        btnSolicitar.disabled = false;
        btnSolicitar.innerHTML = textoOriginal;
    }
});

carregarMedicos();
