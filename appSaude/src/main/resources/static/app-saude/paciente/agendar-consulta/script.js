// paciente/agendar-consulta/script.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

// pré-seleciona a especialidade quando vem do "Acesso rápido" da Home
const especialidadeParam = new URLSearchParams(window.location.search).get("especialidade");
if (especialidadeParam) {
    const select = document.querySelector("#especialidade");
    if ([...select.options].some((o) => o.value === especialidadeParam)) {
        select.value = especialidadeParam;
    }
}

const form = document.querySelector("#form-agendar");
const btnSolicitar = document.querySelector("#btn-solicitar");
const mensagem = document.querySelector("#mensagem-agendamento");

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

    const dto = {
        pacienteId: usuario.id,
        especialidade: document.querySelector("#especialidade").value,
        medico: document.querySelector("#medico").value || null,
        data: document.querySelector("#data").value,
        horario: document.querySelector("#horario").value,
        observacao: document.querySelector("#observacao").value.trim(),
    };

    btnSolicitar.disabled = true;
    mensagem.style.display = "none";

    try {
        await consultaService.criar(dto);
        mostrarMensagem("Consulta solicitada com sucesso! Você será notificado quando for confirmada.");
        form.reset();
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível solicitar o agendamento.", true);
    } finally {
        btnSolicitar.disabled = false;
    }
});