package com.br.appSaude.modules.auth;

import com.br.appSaude.modules.auth.Role;

public record UsuarioAutenticadoResponse(Long id, Long perfilId, Role role) {}