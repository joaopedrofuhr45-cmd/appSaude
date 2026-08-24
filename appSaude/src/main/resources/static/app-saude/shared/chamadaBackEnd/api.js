const BASE_URL = "http://localhost:3000";

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
            throw new Error(error.message || `Erro ${res.status}`);
        }

        return res.status !== 204 ? res.json() : null;
    }
}