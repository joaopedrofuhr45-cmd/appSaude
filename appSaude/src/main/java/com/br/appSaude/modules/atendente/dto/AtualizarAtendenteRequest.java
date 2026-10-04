package com.br.appSaude.modules.atendente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarAtendenteRequest(
        @NotBlank @Size(max = 150) String nome
) {}
