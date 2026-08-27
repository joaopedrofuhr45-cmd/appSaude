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
const blocos = document.querySelectorAll(".bloco");
const mensagemErro = document.querySelector("#mensagem-erro");
const btnReenviar = document.querySelector("#btn-reenviar");

if (!email) {
    window.location.href = "../cadastro-paciente/index.html";
}

authService.enviarCodigoVerificacao(email).catch((error) => {
    mensagemErro.textContent = error.message || "Não foi possível enviar o código.";
});

blocos.forEach((bloco, index) => {
    bloco.addEventListener("input", () => {
        bloco.value = bloco.value.replace(/[^0-9]/g, "");

        if (bloco.value && index < blocos.length - 1) {
            blocos[index + 1].focus();
        }
    });

    bloco.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !bloco.value && index > 0) {
            blocos[index - 1].focus();
        }
    });

    bloco.addEventListener("paste", (event) => {
        event.preventDefault();
        const colado = event.clipboardData.getData("text").replace(/[^0-9]/g, "");

        blocos.forEach((b, i) => {
            b.value = colado[i] || "";
        });

        blocos[Math.min(colado.length, blocos.length) - 1]?.focus();
    });
});

function getCodigoCompleto() {
    return Array.from(blocos).map((b) => b.value).join("");
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagemErro.textContent = "";

    const codigo = getCodigoCompleto();

    if (codigo.length !== blocos.length) {
        mensagemErro.textContent = "Preencha todos os dígitos do código.";
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