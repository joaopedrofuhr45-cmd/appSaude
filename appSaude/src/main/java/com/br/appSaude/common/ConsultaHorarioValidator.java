package com.br.appSaude.common;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
public final class ConsultaHorarioValidator {
 private ConsultaHorarioValidator() {}
 public static void validar(LocalDate data,LocalTime hora,LocalDateTime agora) {
  if(data==null||hora==null||!LocalDateTime.of(data,hora).isAfter(agora))
   throw new IllegalArgumentException("Escolha uma data e horário futuros.");
 }
}