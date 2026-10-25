// paciente/agendar-consulta/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { medicoService } from "../../recursos/chamadaBackEnd/medicoService.js";
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
        }
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível salvar a consulta.", true);
    } finally {
        btnSolicitar.disabled = false;
    }
});

carregarMedicos();
