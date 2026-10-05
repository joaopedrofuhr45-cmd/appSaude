package com.br.appSaude.modules.auth.dto;

import com.br.appSaude.modules.auth.Role;

public record LoginResponse(String token, Long id, Long perfilId, Role role) {}