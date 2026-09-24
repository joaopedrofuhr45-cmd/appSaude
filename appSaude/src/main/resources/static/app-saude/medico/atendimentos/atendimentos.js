// medico/atendimento/login.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login.html";
});

const consultaId = new URLSearchParams(window.location.search).get("id");
const mensagem = document.querySelector("#mensagem-atendimento");

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    mensagem.classList.toggle("estado--erro", erro);
}

async function carregar() {
    if (!consultaId) {
        mostrarMensagem("Consulta não informada.", true);
        return;
    }

    try {
        const consulta = await consultaService.getById(consultaId);

        document.querySelector("#titulo-atendimento").textContent = `Atendimento de ${consulta.paciente ?? "paciente"}`;
        document.querySelector("#pessoa-nome").textContent = consulta.paciente ?? "–";
        document.querySelector("#pessoa-sub").textContent = consulta.pacienteIdade
            ? `${consulta.pacienteIdade} anos`
            : "";
        document.querySelector("#mini-convenio").textContent = consulta.convenio ?? "Particular";
        document.querySelector("#mini-horario").textContent = consulta.horario ?? "–";
        document.querySelector("#mini-situacao").textContent = "Em atendimento";

        if (consulta.observacao) {
            document.querySelector("#observacoes").value = consulta.observacao;
        }
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível carregar a consulta.", true);
    }
}

document.querySelector("#btn-finalizar").addEventListener("click", async () => {
    const prontuario = [
        document.querySelector("#queixa-principal").value.trim(),
        document.querySelector("#historico-clinico").value.trim(),
        document.querySelector("#exame-fisico").value.trim(),
        document.querySelector("#observacoes").value.trim(),
    ].filter(Boolean).join("\n\n");

    try {
        // OBS: a entidade de Consulta no backend ainda não tem campos de
        // prontuário (queixa, histórico, exame físico) — por enquanto tudo
        // isso vai concatenado no campo de observação, junto com o status.
        await consultaService.atualizar(consultaId, {
            status: "REALIZADA",
            observacao: prontuario,
        });
        window.location.href = "../consultas-do-dia/consultas-do-dia.html";
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível finalizar a consulta.", true);
    }
});

carregar();