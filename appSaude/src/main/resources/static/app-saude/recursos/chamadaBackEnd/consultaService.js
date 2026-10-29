
import { ApiService } from "./api.js";

class ConsultaService extends ApiService {

    criar(dto) {
        return this.fetch("/pacientes/consultas", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    }

    horariosIndisponiveis(medicoId, data) {
        const params = new URLSearchParams({ medicoId, data });
        return this.fetch(`/pacientes/consultas/horarios-indisponiveis?${params}`);
    }

    atualizar(id, dto) {
        return this.fetch(`/pacientes/consultas/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    finalizar(id, observacoes) {
        return this.fetch(`/medicos/consultas/${id}/finalizar`, {
            method: "PATCH",
            body: JSON.stringify({ observacoes }),
        });
    }

    cancelar(id) {
        return this.fetch(`/pacientes/consultas/${id}`, {
            method: "DELETE",
        });
    }

    getById(id) {
        const role = JSON.parse(localStorage.getItem("usuario") || "{}").role;
        const base = role === "MEDICO" ? "/medicos" : role === "ATENDENTE" ? "/atendentes" : "/pacientes";
        return this.fetch(`${base}/consultas/${id}`);
    }

    listarPorPaciente(pacienteId) {
        return this.fetch("/pacientes/consultas");
    }

    listarPorStatus(pacienteId, status) {
        return this.fetch("/pacientes/consultas").then((consultas) => consultas.filter((c) => c.status === status));
    }

    listarPorMedico(medicoId, data) {
        return this.fetch("/medicos/consultas").then((consultas) =>
            data ? consultas.filter((c) => c.data === data) : consultas);
    }

    listarTodas(filtros = {}) {
        const params = new URLSearchParams(
            Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== "")
        );
        const query = params.toString();
        return this.fetch(`/atendentes/consultas${query ? `?${query}` : ""}`).then((consultas) =>
            filtros.paciente ? consultas.filter((c) => (c.pacienteNome ?? "").toLowerCase()
                .includes(filtros.paciente.toLowerCase())) : consultas);
    }
}

export const consultaService = new ConsultaService();
