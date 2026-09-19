import { ApiService } from "./api.js";

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
}

export const authService = new AuthService();