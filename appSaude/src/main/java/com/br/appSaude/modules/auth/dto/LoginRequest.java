package com.br.appSaude.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String cpf,
        @NotBlank String senha
) {}