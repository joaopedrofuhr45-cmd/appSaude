import { ApiService } from "./api.js";

class ConsultaService extends ApiService {

    listar() {
        return this.fetch("/consultas");
    }

    getById(id) {
        return this.fetch(`/consultas/${id}`);
    }

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

    listarPorStatus(status) {
        return this.fetch(`/consultas?status=${status}`);
    }
}

export const consultaService = new ConsultaService();