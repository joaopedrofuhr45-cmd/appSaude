package com.br.appSaude.modules.medico;
import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.medico.dto.ConsultaMedicoResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface MedicoConsultaRepository extends JpaRepository<EntityJpaConsultas, Long> {
 @Query("""
  select new com.br.appSaude.modules.medico.dto.ConsultaMedicoResponse(
   c.idConsulta,c.dataConsulta,c.horaConsulta,c.statusConsulta,c.observacoesConsulta,p.id,p.nome,m.especialidadeMedico)
  from EntityJpaConsultas c join c.paciente p join c.medico m
  where m.id=:medicoId
   and (:data is null or c.dataConsulta=:data)
   and (:status is null or :status='' or upper(c.statusConsulta)=upper(:status))
   and (:paciente is null or :paciente='' or lower(p.nome) like lower(concat('%',:paciente,'%')))
  order by c.dataConsulta asc,c.horaConsulta asc
 """)
 List<ConsultaMedicoResponse> buscarAgenda(@Param("medicoId") Long medicoId,@Param("data") LocalDate data,
  @Param("status") String status,@Param("paciente") String paciente);
 Optional<EntityJpaConsultas> findByIdConsultaAndMedico_Id(Long consultaId,Long medicoId);
}