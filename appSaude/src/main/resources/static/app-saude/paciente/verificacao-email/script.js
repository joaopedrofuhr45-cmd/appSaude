// paciente/verificacao-email/script.js
import { authService } from "../../shared/chamadaBackEnd/authService.js";

function getCookie(nome) {
    const encontrado = document.cookie
        .split("; ")
        .find((linha) => linha.startsWith(`${nome}=`));

    return encontrado ? decodeURIComponent(encontrado.split("=")[1]) : null;
}

function apagarCookie(nome) {
    document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

const email = getCookie("cadastro_email");

const form = document.querySelector("#form-verificacao");
const codigoInput = document.querySelector("input[name='codigo']");
const mensagemErro = document.querySelector("#mensagem-erro");
const btnReenviar = document.querySelector("#btn-reenviar");

if (!email) {
    window.location.href = "../cadastro-paciente/index.html";
}

authService.enviarCodigoVerificacao(email).catch((error) => {
    mensagemErro.textContent = error.message || "Não foi possível enviar o código.";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagemErro.textContent = "";

    const codigo = codigoInput.value.trim();

    if (!codigo) {
        mensagemErro.textContent = "Digite o código recebido.";
        return;
    }

    try {
        await authService.confirmarCodigoVerificacao(email, codigo);
        apagarCookie("cadastro_email");
        window.location.href = "../cadastro-concluido/index.html";
    } catch (error) {
        mensagemErro.textContent = error.message || "Código inválido.";
    }
});

btnReenviar.addEventListener("click", async () => {
    mensagemErro.textContent = "";

    try {
        await authService.enviarCodigoVerificacao(email);
        mensagemErro.textContent = "Novo código enviado.";
    } catch (error) {
        mensagemErro.textContent = error.message || "Não foi possível reenviar o código.";
    }
});