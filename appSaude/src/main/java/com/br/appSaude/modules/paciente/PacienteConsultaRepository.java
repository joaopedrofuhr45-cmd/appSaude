package com.br.appSaude.modules.paciente;

import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface PacienteConsultaRepository extends JpaRepository<EntityJpaConsultas, Long> {
    List<EntityJpaConsultas> findByPaciente_IdOrderByDataConsultaDescHoraConsultaDesc(Long pacienteId);
    Optional<EntityJpaConsultas> findByIdConsultaAndPaciente_Id(Long consultaId, Long pacienteId);
    boolean existsByMedico_IdAndDataConsultaAndHoraConsulta(Long medicoId, LocalDate data, LocalTime hora);
}