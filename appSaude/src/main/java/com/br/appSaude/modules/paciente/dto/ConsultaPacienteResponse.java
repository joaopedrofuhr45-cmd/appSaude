package com.br.appSaude.modules.paciente.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ConsultaPacienteResponse(Long id, LocalDate data, LocalTime hora,
                                       String status, String observacoes,
                                       Long medicoId, String medicoNome, String especialidade) {}
