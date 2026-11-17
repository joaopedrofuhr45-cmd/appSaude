import { ApiService } from "./api.js";

class AtendenteService extends ApiService {

    cadastrarMedico(dto) {
        return this.fetch("/atendentes/medicos", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    }

    getPerfil() {
        return this.fetch("/atendentes/perfil");
    }

    atualizarPerfil(id, dto) {
        return this.fetch("/atendentes/perfil", {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    atualizarSenha(id, senhaAtual, novaSenha) {
        return this.fetch("/atendentes/perfil/senha", {
            method: "PATCH",
            body: JSON.stringify({ senhaAtual, novaSenha }),
        });
    }
}

export const atendenteService = new AtendenteService();
