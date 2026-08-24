// shared/js/api.js
// Versão orientada a objetos: uma classe base (ApiService) cuida do fetch/upload,
// e cada domínio (Auth, Consulta, Paciente) herda dela e expõe seus próprios métodos.

const BASE_URL = "http://localhost:3000";

// ---------- classe base ----------

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
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

// ---------- AUTH ----------

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

// ---------- CONSULTAS ----------

class ConsultaService extends ApiService {
    listar() {
        return this.fetch("/consultas");
    }

    getById(id) {
        return this.fetch(`/consultas/${id}`);
    }

    criar(dto) {
        return this.fetch("/consultas", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    }

    atualizar(id, dto) {
        return this.fetch(`/consultas/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    }

    cancelar(id) {
        return this.fetch(`/consultas/${id}`, {
            method: "DELETE",
        });
    }

    listarPorPaciente(pacienteId) {
        return this.fetch(`/consultas?pacienteId=${pacienteId}`);
    }

    listarPorStatus(status) {
        return this.fetch(`/consultas?status=${status}`);
    }
}

// ---------- PACIENTE / PERFIL ----------

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
            body: JSON.stringify({ senhaAtual, novaSenha }),
        });
    }

    excluirConta(id) {
        return this.fetch(`/pacientes/${id}`, {
            method: "DELETE",
        });
    }
}

// ---------- instâncias exportadas ----------
// Cada service é instanciado uma única vez aqui (padrão singleton) e
// reaproveitado em todas as páginas que importarem este arquivo.

export const authService = new AuthService(BASE_URL);
export const consultaService = new ConsultaService(BASE_URL);
export const pacienteService = new PacienteService(BASE_URL);