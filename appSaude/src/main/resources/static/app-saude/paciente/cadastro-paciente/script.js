// paciente/cadastro-paciente/script.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";

const form = document.querySelector("#form-cadastro");
const nomeInput = document.querySelector("input[name='nome']");
const emailInput = document.querySelector("input[name='email']");
const cpfInput = document.querySelector("input[name='cpf']");
const telefoneInput = document.querySelector("input[name='telefone']");
const senhaInput = document.querySelector("input[name='senha']");
const confirmarSenhaInput = document.querySelector("input[name='confirmar_senha']");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const cpf = cpfInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    if (!nome || !email || !cpf || !telefone || !senha || !confirmarSenha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    const dto = { nome, email, cpf, telefone, senha };

    try {
        await authService.cadastrar(dto);
        window.location.href = "../verificacao-email/index.html";
    } catch (error) {
        alert(error.message || "Não foi possível concluir o cadastro.");
    }
});