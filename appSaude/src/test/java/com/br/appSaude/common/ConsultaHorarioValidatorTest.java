package com.br.appSaude.common;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
class ConsultaHorarioValidatorTest {
 private final LocalDateTime agora=LocalDateTime.of(2026,10,24,18,0);
 @Test void aceitaHorarioFuturo(){assertDoesNotThrow(()->ConsultaHorarioValidator.validar(LocalDate.of(2026,10,24),LocalTime.of(18,1),agora));}
 @Test void rejeitaHorarioPassadoNoMesmoDia(){assertThrows(IllegalArgumentException.class,()->ConsultaHorarioValidator.validar(LocalDate.of(2026,10,24),LocalTime.of(17,59),agora));}
 @Test void rejeitaHorarioIgualAoAtual(){assertThrows(IllegalArgumentException.class,()->ConsultaHorarioValidator.validar(LocalDate.of(2026,10,24),LocalTime.of(18,0),agora));}
}