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

    listarPorPaciente(pacienteId) {
        return this.fetch(`/consultas?pacienteId=${pacienteId}`);
    }

    listarPorStatus(pacienteId, status) {
        return this.fetch(`/consultas?pacienteId=${pacienteId}&status=${status}`);
    }
}

export const consultaService = new ConsultaService();