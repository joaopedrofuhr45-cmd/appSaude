// paciente/configuracoes/script.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { pacienteService } from "../../recursos/chamadaBackEnd/pacienteService.js";
import { preencherSidebarUsuario } from "../../recursos/js/sidebarUsuario.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarUsuario(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../login/login.html";
});

const form = document.querySelector("#form-perfil");
const nomeInput = document.querySelector("#nome");
const cpfInput = document.querySelector("#cpf");
const telefoneInput = document.querySelector("#telefone");
const btnSalvar = document.querySelector("#btn-salvar");
const mensagem = document.querySelector("#mensagem-perfil");

const prefEmail = document.querySelector("#pref-email");
const prefSms = document.querySelector("#pref-sms");

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    mensagem.classList.toggle("estado--erro", erro);
}

async function carregarPerfil() {
    if (!usuario?.id) {
        mostrarMensagem("Não foi possível identificar o paciente logado.", true);
        return;
    }

    try {
        const perfil = await pacienteService.getPerfil(usuario.id);
        nomeInput.value = perfil.nome ?? "";
        cpfInput.value = perfil.cpf ?? "";
        telefoneInput.value = perfil.telefone ?? "";
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível carregar seus dados.", true);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!usuario?.id) return;

    const dto = {
        nome: nomeInput.value.trim(),
        telefone: telefoneInput.value.trim(),
    };

    btnSalvar.disabled = true;
    mensagem.style.display = "none";

    try {
        await pacienteService.atualizarPerfil(usuario.id, dto);
        mostrarMensagem("Dados atualizados com sucesso.");
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível salvar as alterações.", true);
    } finally {
        btnSalvar.disabled = false;
    }
});

// OBS: ainda não existe endpoint de preferências de notificação no backend.
// Por enquanto guardamos a escolha localmente pra não travar a tela; quando
// a rota existir (ex.: pacienteService.atualizarPreferencias), é só trocar
// este bloco por uma chamada real.
function carregarPreferenciasLocais() {
    const salvas = JSON.parse(localStorage.getItem("preferenciasNotificacao") || "{}");
    prefEmail.checked = salvas.email ?? true;
    prefSms.checked = salvas.sms ?? true;
}

function salvarPreferenciasLocais() {
    localStorage.setItem(
        "preferenciasNotificacao",
        JSON.stringify({ email: prefEmail.checked, sms: prefSms.checked })
    );
}

prefEmail.addEventListener("change", salvarPreferenciasLocais);
prefSms.addEventListener("change", salvarPreferenciasLocais);

carregarPerfil();
carregarPreferenciasLocais();