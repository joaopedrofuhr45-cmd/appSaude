package com.br.appSaude.modules.paciente;
import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.paciente.dto.ConsultaPacienteResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
public interface PacienteConsultaRepository extends JpaRepository<EntityJpaConsultas,Long> {
 @Query("""
  select new com.br.appSaude.modules.paciente.dto.ConsultaPacienteResponse(
   c.idConsulta,c.dataConsulta,c.horaConsulta,c.statusConsulta,c.observacoesConsulta,m.id,m.nome,m.especialidadeMedico)
  from EntityJpaConsultas c join c.medico m
  where c.paciente.id=:pacienteId and (:status is null or c.statusConsulta=:status)
  order by c.dataConsulta desc,c.horaConsulta desc
 """)
 List<ConsultaPacienteResponse> listarRespostas(@Param("pacienteId") Long pacienteId,@Param("status") String status);
 Optional<EntityJpaConsultas> findByIdConsultaAndPaciente_Id(Long consultaId,Long pacienteId);
 boolean existsByMedico_IdAndDataConsultaAndHoraConsultaAndStatusConsultaNot(Long medicoId,LocalDate data,LocalTime hora,String statusConsulta);
 boolean existsByMedico_IdAndDataConsultaAndHoraConsultaAndStatusConsultaNotAndIdConsultaNot(Long medicoId,LocalDate data,LocalTime hora,String statusConsulta,Long idConsulta);

 List<EntityJpaConsultas> findByMedico_IdAndDataConsultaAndStatusConsultaNot(Long medicoId,LocalDate data,String statusConsulta);
}