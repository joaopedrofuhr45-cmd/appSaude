package com.br.appSaude.modules.paciente.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AgendarConsultaRequest(
        @NotNull @FutureOrPresent LocalDate data,
        @NotNull LocalTime hora,
        @NotNull Long medicoId,
        String observacoes
) {}
