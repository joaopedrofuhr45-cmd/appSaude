package com.br.appSaude.modules.medico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarMedicoRequest(
        @NotBlank @Size(max = 150) String nome,
        @Size(max = 100) String especialidade,
        @Size(max = 20) String crm
) {}
