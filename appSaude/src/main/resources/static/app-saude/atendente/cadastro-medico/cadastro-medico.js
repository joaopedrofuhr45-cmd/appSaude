import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { atendenteService } from "../../recursos/chamadaBackEnd/atendenteService.js";
import { medicoService } from "../../recursos/chamadaBackEnd/medicoService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario, "Atendente · Recepção");

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

const form = document.querySelector("#form-medico");
const cpfInput = document.querySelector("#cpf");
const especialidadeSelect = document.querySelector("#especialidade");
const senhaInput = document.querySelector("#senha");
const confirmarSenhaInput = document.querySelector("#confirmar-senha");
const botaoCadastrar = document.querySelector("#btn-cadastrar");
const mensagem = document.querySelector("#mensagem");
const especialidadesPadrao = ["Clínico geral", "Cardiologia", "Oftalmologia", "Pediatria"];

async function carregarEspecialidades() {
    let especialidades = [];
    try {
        especialidades = await medicoService.listarEspecialidades();
    } catch {
        // Mantém as especialidades principais disponíveis caso a lista não carregue.
    }

    const unicas = new Map();
    for (const item of [...especialidadesPadrao, ...especialidades]) {
        const nome = String(item ?? "").trim();
        const chave = nome.toLocaleLowerCase("pt-BR");
        if (nome && !unicas.has(chave)) unicas.set(chave, nome);
    }

    especialidadeSelect.replaceChildren(new Option("Selecione", ""));
    for (const nome of unicas.values()) {
        especialidadeSelect.add(new Option(nome, nome));
    }
}

cpfInput.addEventListener("input", () => {
    cpfInput.value = cpfInput.value.replace(/\D/g, "").slice(0, 11);
});

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.hidden = false;
    mensagem.classList.toggle("estado--erro", erro);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagem.hidden = true;

    if (senhaInput.value !== confirmarSenhaInput.value) {
        mostrarMensagem("As senhas não coincidem.", true);
        confirmarSenhaInput.focus();
        return;
    }

    botaoCadastrar.disabled = true;
    botaoCadastrar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cadastrando...';

    try {
        const medico = await atendenteService.cadastrarMedico({
            nome: document.querySelector("#nome").value.trim(),
            cpf: cpfInput.value,
            especialidade: especialidadeSelect.value,
            crm: document.querySelector("#crm").value.trim(),
            email: document.querySelector("#email").value.trim(),
            telefone: document.querySelector("#telefone").value.trim(),
            senha: senhaInput.value,
        });

        mostrarMensagem(`Médico ${medico.nome} cadastrado com sucesso. O acesso já está liberado.`);
        form.reset();
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível cadastrar o médico.", true);
    } finally {
        botaoCadastrar.disabled = false;
        botaoCadastrar.innerHTML = '<i class="fa-solid fa-user-plus"></i> Cadastrar médico';
    }
});

carregarEspecialidades();
