import { ApiService } from "./api.js";

class VerificacaoEmailService extends ApiService {

    enviarCodigo(email) {
        return this.fetch("/auth/verificacao/enviar", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    }

    confirmarCodigo(email, codigo) {
        return this.fetch("/auth/verificacao/confirmar", {
            method: "POST",
            body: JSON.stringify({ email, codigo }),
        });
    }
}

export const verificacaoEmailService = new VerificacaoEmailService();