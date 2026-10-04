package com.br.appSaude.modules.medico;

import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicoConsultaRepository extends JpaRepository<EntityJpaConsultas, Long> {
    List<EntityJpaConsultas> findByMedico_IdOrderByDataConsultaAscHoraConsultaAsc(Long medicoId);
    Optional<EntityJpaConsultas> findByIdConsultaAndMedico_Id(Long consultaId, Long medicoId);
}
