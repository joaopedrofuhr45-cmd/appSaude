import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { medicoService } from "../../recursos/chamadaBackEnd/medicoService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);
document.querySelector("#btn-logout").addEventListener("click", () => { authService.logout(); window.location.href = "../login/login.html"; });
const params = new URLSearchParams(window.location.search);
const editandoId = params.get("id");
const form = document.querySelector("#form-agendar");
const btnSolicitar = document.querySelector("#btn-solicitar");
const mensagem = document.querySelector("#mensagem-agendamento");
const inputData = document.querySelector("#data");
const inputHorario = document.querySelector("#horario");
const campoHorarios = document.querySelector("#campo-horarios");
const horarioOriginal = params.get("horario") ?? "";
const dataOriginal = params.get("data") ?? "";
const medicoOriginal = params.get("medicoId") ?? "";
let inicioSemana = new Date();
inicioSemana.setHours(0, 0, 0, 0);
let horariosOcupados = new Set();
let requestId = 0;
const hojeIso = dataIso(inicioSemana);

if (params.get("especialidade")) document.querySelector("#especialidade").value = params.get("especialidade");
if (editandoId) {
    inputData.value = params.get("data") ?? "";
    inputHorario.value = params.get("horario") ?? "";
    document.querySelector("#observacao").value = params.get("observacao") ?? "";
    document.querySelector("#btn-solicitar").innerHTML = '<i class="fa-regular fa-floppy-disk"></i> Salvar alterações';
}

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    mensagem.classList.toggle("estado--erro", erro);
}
function dataIso(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function horarioJaPassou(data, hora) {
    if (data !== dataIso(new Date())) return false;
    const [h, m] = hora.split(":").map(Number);
    const agora = new Date();
    return h * 60 + m <= agora.getHours() * 60 + agora.getMinutes();
}
function renderizarDatas() {
    const dias = document.querySelector("#datas-disponiveis");
    dias.replaceChildren();
    document.querySelector("#periodo-data").textContent = inicioSemana.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    for (let i = 0; i < 7; i++) {
        const dia = new Date(inicioSemana);
        dia.setDate(dia.getDate() + i);
        const valor = dataIso(dia);
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `data-opcao${inputData.value === valor ? " selecionada" : ""}`;
        botao.innerHTML = `<span>${dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span><strong>${dia.getDate()}</strong>`;
        botao.setAttribute("aria-pressed", String(inputData.value === valor));
        botao.disabled = valor < hojeIso;
        botao.addEventListener("click", () => { inputData.value = valor; inputHorario.value = ""; renderizarDatas(); carregarHorarios(); });
        dias.append(botao);
    }
}
async function carregarHorarios() {
    const id = ++requestId;
    const medicoId = document.querySelector("#medico").value;
    const container = document.querySelector("#horarios-disponiveis");
    const estado = document.querySelector("#estado-horarios");
    container.replaceChildren();
    horariosOcupados = new Set();
    const manterHorarioOriginal = editandoId && medicoId === medicoOriginal && inputData.value === dataOriginal && horarioOriginal;
    inputHorario.value = manterHorarioOriginal ? horarioOriginal : "";
    if (!inputData.value) { campoHorarios.hidden = true; return; }
    campoHorarios.hidden = false;
    if (!medicoId) { estado.hidden = false; estado.textContent = "Selecione um médico para consultar os horários."; return; }
    estado.classList.remove("estado--erro");
    estado.hidden = false;
    estado.textContent = "Carregando horários...";
    try {
        const ocupados = await consultaService.horariosIndisponiveis(medicoId, inputData.value);
        if (id !== requestId) return;
        horariosOcupados = new Set(ocupados);
        const grupos = [
            { titulo: "Manhã", horarios: [] },
            { titulo: "Tarde", horarios: [] },
        ];
        for (let min = 480; min <= 1050; min += 30) {
            const hora = `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
            grupos[min < 720 ? 0 : 1].horarios.push({ hora, min });
        }
        for (const grupo of grupos) {
            const secao = document.createElement("section");
            secao.className = "grupo-horarios";
            const titulo = document.createElement("h3");
            titulo.textContent = grupo.titulo;
            const opcoes = document.createElement("div");
            opcoes.className = "horarios-disponiveis";
            for (const { hora, min } of grupo.horarios) {
                const ocupado = horariosOcupados.has(hora);
                const passado = horarioJaPassou(inputData.value, hora);
                const consultaAtual = Boolean(manterHorarioOriginal && hora === horarioOriginal);
                const inativo = passado || (ocupado && !consultaAtual);
                const botao = document.createElement("button");
                botao.type = "button";
                botao.className = `horario-opcao${inativo ? " indisponivel" : ""}${consultaAtual ? " consulta-atual selecionado" : ""}${passado ? " horario-passado" : ""}`;
                botao.textContent = hora;
                if (consultaAtual) botao.title = "Horário da consulta que está sendo editada";
                botao.disabled = inativo;
                botao.setAttribute("aria-pressed", String(consultaAtual));
                botao.setAttribute("aria-label", consultaAtual ? `${hora}, horário atual da consulta em edição` : passado ? `${hora}, horário já passado` : ocupado ? `${hora}, horário indisponível` : hora);
                botao.addEventListener("click", () => {
                    inputHorario.value = hora;
                    container.querySelectorAll(".horario-opcao").forEach((el) => el.classList.remove("selecionado"));
                    botao.classList.add("selecionado");
                });
                opcoes.append(botao);
            }
            secao.append(titulo, opcoes);
            container.append(secao);
        }
        estado.textContent = "";
        estado.hidden = true;
    } catch (error) {
        if (id !== requestId) return;
        estado.hidden = false;
        estado.textContent = error.message || "Não foi possível carregar os horários.";
        estado.classList.add("estado--erro");
    }
}
async function carregarMedicos() {
    const select = document.querySelector("#medico");
    const especialidade = document.querySelector("#especialidade");
    const atualizar = async () => {
        select.replaceChildren(new Option("Selecione o médico", ""));
        inputHorario.value = "";
        if (!especialidade.value) { await carregarHorarios(); return; }
        try {
            const medicos = await medicoService.listar(especialidade.value);
            medicos.forEach((medico) => select.add(new Option(`${medico.nome} · ${medico.especialidade ?? ""}`, medico.id)));
            const medicoParam = params.get("medicoId");
            if (editandoId && medicoParam && [...select.options].some((option) => option.value === medicoParam)) select.value = medicoParam;
            await carregarHorarios();
        } catch (error) { mostrarMensagem(error.message || "Não foi possível carregar os médicos.", true); }
    };
    especialidade.addEventListener("change", atualizar);
    select.addEventListener("change", carregarHorarios);
    await atualizar();
}
document.querySelector("#mes-anterior").addEventListener("click", () => {
    const novaSemana = new Date(inicioSemana);
    novaSemana.setDate(novaSemana.getDate() - 7);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    inicioSemana = novaSemana < hoje ? hoje : novaSemana;
    renderizarDatas();
});
document.querySelector("#proxima-semana").addEventListener("click", () => { inicioSemana.setDate(inicioSemana.getDate() + 7); renderizarDatas(); });
document.querySelector("#hoje").addEventListener("click", () => { inicioSemana = new Date(); inicioSemana.setHours(0, 0, 0, 0); inputData.value = dataIso(inicioSemana); renderizarDatas(); carregarHorarios(); });
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!usuario?.id) { mostrarMensagem("Não foi possível identificar o paciente logado.", true); return; }
    const dto = { medicoId: Number(document.querySelector("#medico").value), data: inputData.value, hora: inputHorario.value, observacoes: document.querySelector("#observacao").value.trim() };
    const mantendoHorario = editandoId && String(dto.medicoId) === medicoOriginal && dto.data === dataOriginal && dto.hora === horarioOriginal;
    if (!dto.medicoId || !dto.data || !dto.hora || horarioJaPassou(dto.data, dto.hora) || (horariosOcupados.has(dto.hora) && !mantendoHorario)) { mostrarMensagem("Selecione um médico, uma data e um horário disponível.", true); return; }
    btnSolicitar.disabled = true;
    const textoOriginal = btnSolicitar.innerHTML;
    btnSolicitar.textContent = editandoId ? "Salvando alterações..." : "Agendando consulta...";
    mensagem.style.display = "none";
    try {
        if (editandoId) { await consultaService.atualizar(editandoId, dto); mostrarMensagem("Consulta atualizada com sucesso!"); }
        else { await consultaService.criar(dto); mostrarMensagem("Consulta solicitada com sucesso! Você será notificado quando for confirmada."); form.reset(); inputData.value = ""; inputHorario.value = ""; campoHorarios.hidden = true; renderizarDatas(); }
    } catch (error) { mostrarMensagem(error.message || "Não foi possível salvar a consulta.", true); }
    finally { btnSolicitar.disabled = false; btnSolicitar.innerHTML = textoOriginal; }
});
if (inputData.value && inputData.value >= hojeIso) inicioSemana = new Date(`${inputData.value}T00:00:00`);
else if (inputData.value) { inputData.value = ""; inputHorario.value = ""; }
renderizarDatas();
carregarMedicos();
