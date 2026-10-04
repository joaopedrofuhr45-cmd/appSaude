package com.br.appSaude.modules.medico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FinalizarConsultaRequest(@NotBlank @Size(max = 10000) String observacoes) {}
