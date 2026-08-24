import { ApiService } from "./apiService.js";

class AuthService extends ApiService {

    login(cpf, senha) {
        return this.fetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ cpf, senha }),
        });
    }

    cadastrar(dto) {
        return this.fetch("/auth/cadastro", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    }

    enviarCodigoVerificacao(email) {
        return this.fetch("/auth/verificacao/enviar", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    }

    confirmarCodigoVerificacao(email, codigo) {
        return this.fetch("/auth/verificacao/confirmar", {
            method: "POST",
            body: JSON.stringify({ email, codigo }),
        });
    }

    validarDados(dto) {
        return this.fetch("/auth/validacao", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    }

    enviarSelfie(file) {
        const formData = new FormData();
        formData.append("selfie", file);

        return this.upload("/auth/selfie", formData);
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
    }

    salvarSessao(token, usuario) {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));
    }

    getUsuarioLogado() {
        const raw = localStorage.getItem("usuario");

        return raw ? JSON.parse(raw) : null;
    }

    isAutenticado() {
        return !!localStorage.getItem("token");
    }
}

export const authService = new AuthService();