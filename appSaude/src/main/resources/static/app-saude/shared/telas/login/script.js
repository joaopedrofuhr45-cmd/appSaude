import { authService } from "../shared/js/api.js";

const form = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const senhaInput = document.querySelector("#senha");
const mensagem = document.querySelector("#mensagem");


form.addEventListener("submit", async(event)=>{
    event.preventDefault();


    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        mensagem.textContent = "Preencha todos os campos.";
        return;
    }

    mensagem.textContent = "";

    try {
        const resposta = await authService.login(email, senha);

        authService.salvarSessao(resposta.token, reposta.usuario);


        window.location.href = "/pages/home.html";

    } catch (error) {
        mensagem.textContent = error.message;
    }
})


