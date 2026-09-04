import { authService } from "../../recursos/chamadaBackEnd/authService.js";

const form = document.querySelector("#loginForm");
const cpfInput = document.querySelector("#cpf");
const senhaInput = document.querySelector("#senha");
const mensagem = document.querySelector("#mensagem");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cpf = cpfInput.value.trim();
    const senha = senhaInput.value;

    if (!cpf || !senha) {
        mensagem.textContent = "Preencha todos os campos.";
        return;
    }

    mensagem.textContent = "";

    try {
        const resposta = await authService.login(cpf, senha);
        authService.salvarSessao(resposta.token, resposta.usuario);
        window.location.href = "../../paciente/tela-inicial/index.html";
    } catch (error) {
        mensagem.textContent = error.message;
    }
});s