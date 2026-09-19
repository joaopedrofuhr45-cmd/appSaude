
import { ApiService } from "./api.js";

class ConsultaService extends ApiService {

    criar(dto) {
        return this.fetch("/consultas", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    }

    atualizar(id, dto) {
        return this.fetch(`/consultas/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    cancelar(id) {
        return this.fetch(`/consultas/${id}`, {
            method: "DELETE",
        });
    }

    getById(id) {
        return this.fetch(`/consultas/${id}`);
    }

    listarPorPaciente(pacienteId) {
        return this.fetch(`/consultas?pacienteId=${pacienteId}`);
    }

    listarPorStatus(pacienteId, status) {
        return this.fetch(`/consultas?pacienteId=${pacienteId}&status=${status}`);
    }

    listarPorMedico(medicoId, data) {
        const params = new URLSearchParams({ medicoId });
        if (data) params.set("data", data);
        return this.fetch(`/consultas?${params.toString()}`);
    }

    listarTodas(filtros = {}) {
        const params = new URLSearchParams(
            Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== "")
        );
        const query = params.toString();
        return this.fetch(`/consultas${query ? `?${query}` : ""}`);
    }
}

export const consultaService = new ConsultaService();