package com.br.appSaude.modules.atendente.dto;
import java.time.LocalDate;
import java.time.LocalTime;
public record ConsultaAtendenteResponse(Long id,LocalDate data,LocalTime hora,String status,String observacoes,
 Long pacienteId,String pacienteNome,Long medicoId,String medicoNome,String especialidade) {}
