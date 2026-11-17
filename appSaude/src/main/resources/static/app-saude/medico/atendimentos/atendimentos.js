// medico/atendimento/login-medico-atendente.js
import { authService } from "../../recursos/chamadaBackEnd/authService.js";
import { consultaService } from "../../recursos/chamadaBackEnd/consultaService.js";
import { preencherSidebarStaff } from "../../recursos/js/staffSidebar.js";

const usuario = authService.getUsuarioLogado();
preencherSidebarStaff(usuario);

document.querySelector("#btn-logout").addEventListener("click", () => {
    authService.logout();
    window.location.href = "../../telas-comuns/login-medico-atendente/login-medico-atendente.html";
});

const consultaId = new URLSearchParams(window.location.search).get("id");
const mensagem = document.querySelector("#mensagem-atendimento");
let consultaPodeSerFinalizada = false;

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
        const status = String(consulta.status ?? "").toUpperCase();

        document.querySelector("#titulo-atendimento").textContent = `Atendimento de ${consulta.pacienteNome ?? "paciente"}`;
        document.querySelector("#pessoa-nome").textContent = consulta.pacienteNome ?? "–";
        document.querySelector("#pessoa-sub").textContent = consulta.pacienteIdade
            ? `${consulta.pacienteIdade} anos`
            : "";
        document.querySelector("#mini-horario").textContent = consulta.hora
            ? String(consulta.hora).slice(0, 5)
            : "–";
        document.querySelector("#mini-situacao").textContent = status === "REALIZADA"
            ? "Finalizada"
            : status === "CANCELADA" ? "Cancelada" : "Em atendimento";
        if (consulta.observacoes) {
            document.querySelector("#observacoes").value = consulta.observacoes;
        }

        if (status === "REALIZADA" || status === "CANCELADA") {
            document.querySelectorAll(".prontuario-blocks textarea").forEach((campo) => { campo.disabled = true; });
            document.querySelector("#tempo-atendimento").textContent = status === "REALIZADA" ? "Finalizada" : "Cancelada";
            mostrarMensagem("Esta consulta já foi finalizada ou cancelada e não pode iniciar outro atendimento.", true);
            return;
        }
        consultaPodeSerFinalizada = true;
        document.querySelector("#btn-finalizar").disabled = false;
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível carregar a consulta.", true);
    }
}

document.querySelector("#btn-finalizar").addEventListener("click", async () => {
    if (!consultaPodeSerFinalizada) return;
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
        await consultaService.finalizar(consultaId, prontuario);
        window.location.href = "../consultas-do-dia/consultas-do-dia.html";
    } catch (error) {
        mostrarMensagem(error.message || "Não foi possível finalizar a consulta.", true);
    }
});

carregar();
