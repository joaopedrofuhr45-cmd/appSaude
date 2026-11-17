package com.br.appSaude.modules.medico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarMedicoRequest(
        @NotBlank @Size(max = 150) String nome,
        @jakarta.validation.constraints.Email @Size(max = 150) String email,
        @Size(max = 20) String telefone
) {}
