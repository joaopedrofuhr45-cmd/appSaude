package com.br.appSaude.modules.medico.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ConsultaMedicoResponse(Long id, LocalDate data, LocalTime hora,
                                     String status, String observacoes,
                                     Long pacienteId, String pacienteNome) {}
