import { ApiService } from "./apiService.js";

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

    atualizarFoto(id, file) {
        const formData = new FormData();
        formData.append("foto", file);

        return this.upload(`/pacientes/${id}/foto`, formData);
    }

    atualizarSenha(id, senhaAtual, novaSenha) {
        return this.fetch(`/pacientes/${id}/senha`, {
            method: "PUT",
            body: JSON.stringify({
                senhaAtual,
                novaSenha,
            }),
        });
    }

    excluirConta(id) {
        return this.fetch(`/pacientes/${id}`, {
            method: "DELETE",
        });
    }
}

export const pacienteService = new PacienteService();