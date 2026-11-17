package com.br.appSaude.modules.atendente;
import com.br.appSaude.modules.atendente.dto.ConsultaAtendenteResponse;
import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
public interface AtendenteConsultaRepository extends JpaRepository<EntityJpaConsultas, Long> {
 @Query("""
  select new com.br.appSaude.modules.atendente.dto.ConsultaAtendenteResponse(
   c.idConsulta,c.dataConsulta,c.horaConsulta,c.statusConsulta,c.observacoesConsulta,
   p.id,p.nome,m.id,m.nome,m.especialidadeMedico)
  from EntityJpaConsultas c join c.paciente p join c.medico m
  where (:data is null or c.dataConsulta=:data)
   and (:status is null or :status='' or upper(c.statusConsulta)=upper(:status))
   and (:paciente is null or :paciente='' or lower(p.nome) like lower(concat('%',:paciente,'%')))
  order by c.dataConsulta asc,c.horaConsulta asc
 """)
 List<ConsultaAtendenteResponse> buscarAgenda(@Param("status") String status,@Param("data") LocalDate data,@Param("paciente") String paciente);
}