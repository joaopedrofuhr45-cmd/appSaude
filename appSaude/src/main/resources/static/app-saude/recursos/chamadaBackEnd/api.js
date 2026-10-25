const BASE_URL = window.location.origin;

export class ApiService {
    constructor() {
        this.baseUrl = BASE_URL;
    }

    #getToken() {
        return localStorage.getItem("token");
    }

    async fetch(endpoint, options = {}) {
        const token = this.#getToken();

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            if (res.status === 401) {
                const eraStaff = location.pathname.includes("/medico/") || location.pathname.includes("/atendente/");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                if (!location.pathname.includes("login")) {
                    location.href = eraStaff
                        ? "/app-saude/telas-comuns/login-medico-atendente/login-medico-atendente.html"
                        : "/app-saude/paciente/login/login.html";
                }
            }
            throw new Error(error.message || `Erro ${res.status}`);
        }

        return res.status !== 204 ? res.json() : null;
    }

    async upload(endpoint, formData) {
        const token = this.#getToken();

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            if (res.status === 401) {
                const eraStaff = location.pathname.includes("/medico/") || location.pathname.includes("/atendente/");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                if (!location.pathname.includes("login")) location.href = eraStaff
                    ? "/app-saude/telas-comuns/login-medico-atendente/login-medico-atendente.html"
                    : "/app-saude/paciente/login/login.html";
            }
            throw new Error(error.message || `Erro ${res.status}`);
        }

        return res.status !== 204 ? res.json() : null;
    }
}
