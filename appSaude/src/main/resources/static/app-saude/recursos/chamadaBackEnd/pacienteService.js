import { ApiService } from "./api.js";

class PacienteService extends ApiService {

    getPerfil(id) {
        return this.fetch(`/pacientes/${id}`);
    }

    atualizarPerfil(id, dto) {
        return this.fetch(`/pacientes/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }
}

export const pacienteService = new PacienteService();