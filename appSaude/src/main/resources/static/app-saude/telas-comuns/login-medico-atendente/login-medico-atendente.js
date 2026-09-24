// telas-comuns/login-medico-atendente/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";

const form = document.querySelector("#loginForm");
const cpfInput = document.querySelector("#cpf");
const senhaInput = document.querySelector("#senha");
const mensagem = document.querySelector("#mensagem");

// Assumindo que o backend devolve usuario.tipo ("ATENDENTE" | "MEDICO").
// Isso ainda não existe no backend — é uma decisão de contrato pra o front
// saber pra onde mandar cada um depois do login.
const DESTINO_POR_TIPO = {
    ATENDENTE: "../../atendente/atendimentos/atendimentos.html",
    MEDICO: "../../medico/consultas-do-dia/consultas-do-dia.html",
};

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

        const destino = DESTINO_POR_TIPO[resposta.usuario?.tipo] ?? "../menu-inicial/menu_inicial.html";
        window.location.href = destino;
    } catch (error) {
        mensagem.textContent = error.message;
    }
});