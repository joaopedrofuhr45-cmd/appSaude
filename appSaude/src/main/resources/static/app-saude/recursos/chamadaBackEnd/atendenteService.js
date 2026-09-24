import { ApiService } from "./api.js";

class AtendenteService extends ApiService {

    getPerfil(id) {
        return this.fetch(`/atendentes/${id}`);
    }

    atualizarPerfil(id, dto) {
        return this.fetch(`/atendentes/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    atualizarSenha(id, senhaAtual, novaSenha) {
        return this.fetch(`/atendentes/${id}/senha`, {
            method: "PUT",
            body: JSON.stringify({ senhaAtual, novaSenha }),
        });
    }
}

export const atendenteService = new AtendenteService();