import { ApiService } from "./api.js";

class MedicoService extends ApiService {

    getPerfil(id) {
        return this.fetch(`/medicos/${id}`);
    }

    atualizarPerfil(id, dto) {
        return this.fetch(`/medicos/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    atualizarSenha(id, senhaAtual, novaSenha) {
        return this.fetch(`/medicos/${id}/senha`, {
            method: "PUT",
            body: JSON.stringify({ senhaAtual, novaSenha }),
        });
    }
}

export const medicoService = new MedicoService();