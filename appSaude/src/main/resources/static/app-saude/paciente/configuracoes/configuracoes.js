// paciente/configuracoes/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { pacienteService } from "../../recursos/chamadaBackEnd/pacienteService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const formPerfil = document.querySelector("#form-perfil");
const nomeInput = document.querySelector("#nome");
const emailInput = document.querySelector("#email");
const telefoneInput = document.querySelector("#telefone");
const btnSalvar = document.querySelector("#btn-salvar");
const mensagemPerfil = document.querySelector("#mensagem-perfil");

function mostrarMensagem(el, texto, erro = false) {
    el.textContent = texto;
    el.style.display = "block";
    el.classList.toggle("estado--erro", erro);
}

async function carregarPerfil() {
    if (!usuario?.id) {
        mostrarMensagem(mensagemPerfil, "Não foi possível identificar o paciente logado.", true);
        return;
    }

    try {
        const perfil = await pacienteService.getPerfil(usuario.id);
        nomeInput.value = perfil.nome ?? "";
        emailInput.value = perfil.email ?? "";
        telefoneInput.value = perfil.telefone ?? "";
    } catch (error) {
        mostrarMensagem(mensagemPerfil, error.message || "Não foi possível carregar seus dados.", true);
    }
}

formPerfil.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!usuario?.id) return;

    const dto = {
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        telefone: telefoneInput.value.trim(),
    };

    btnSalvar.disabled = true;
    mensagemPerfil.style.display = "none";

    try {
        await pacienteService.atualizarPerfil(usuario.id, dto);
        mostrarMensagem(mensagemPerfil, "Dados atualizados com sucesso.");
    } catch (error) {
        mostrarMensagem(mensagemPerfil, error.message || "Não foi possível salvar as alterações.", true);
    } finally {
        btnSalvar.disabled = false;
    }
});

const formSenha = document.querySelector("#form-senha");
const senhaAtualInput = document.querySelector("#senha-atual");
const novaSenhaInput = document.querySelector("#nova-senha");
const confirmarNovaSenhaInput = document.querySelector("#confirmar-nova-senha");
const btnSalvarSenha = document.querySelector("#btn-salvar-senha");
const mensagemSenha = document.querySelector("#mensagem-senha");

formSenha.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!usuario?.id) return;

    if (novaSenhaInput.value !== confirmarNovaSenhaInput.value) {
        mostrarMensagem(mensagemSenha, "As senhas não coincidem.", true);
        return;
    }

    if (novaSenhaInput.value.length < 8) {
        mostrarMensagem(mensagemSenha, "A nova senha precisa ter pelo menos 8 caracteres.", true);
        return;
    }

    btnSalvarSenha.disabled = true;
    mensagemSenha.style.display = "none";

    try {
        await pacienteService.atualizarSenha(usuario.id, senhaAtualInput.value, novaSenhaInput.value);
        mostrarMensagem(mensagemSenha, "Senha atualizada com sucesso.");
        formSenha.reset();
    } catch (error) {
        mostrarMensagem(mensagemSenha, error.message || "Não foi possível atualizar a senha.", true);
    } finally {
        btnSalvarSenha.disabled = false;
    }
});

carregarPerfil();