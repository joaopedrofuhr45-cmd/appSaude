// paciente/agendar-consulta/login.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const params = new URLSearchParams(window.location.search);
const editandoId = params.get("id");

const especialidadeParam = params.get("especialidade");
if (especialidadeParam) {
    const select = document.querySelector("#especialidade");
    if ([...select.options].some((o) => o.value === especialidadeParam)) {
        select.value = especialidadeParam;
    }
}

if (editandoId) {
    document.querySelector("#data").value = params.get("data") ?? "";
    document.querySelector("#horario").value = params.get("horario") ?? "";
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
        if (editandoId) {
            await consultaService.atualizar(editandoId, dto);
            mostrarMensagem("Consulta atualizada com sucesso!");
        } else {
            await consultaService.criar(dto);
            mostrarMensagem("Consulta solicitada com sucesso! Você será notificado quando for confirmada.");
            form.reset();
        }
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível salvar a consulta.", true);
    } finally {
        btnSolicitar.disabled = false;
    }
});