import { ApiService } from "./api.js";

class MedicoService extends ApiService {

    listar(especialidade) {
        const query = especialidade ? `?especialidade=${encodeURIComponent(especialidade)}` : "";
        return this.fetch(`/medicos${query}`);
    }

    listarEspecialidades() {
        return this.fetch("/medicos/especialidades");
    }

    getPerfil() {
        return this.fetch("/medicos/perfil");
    }

    atualizarPerfil(id, dto) {
        return this.fetch("/medicos/perfil", {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    atualizarSenha(id, senhaAtual, novaSenha) {
        return this.fetch("/medicos/perfil/senha", {
            method: "PATCH",
            body: JSON.stringify({ senhaAtual, novaSenha }),
        });
    }
}

export const medicoService = new MedicoService();
