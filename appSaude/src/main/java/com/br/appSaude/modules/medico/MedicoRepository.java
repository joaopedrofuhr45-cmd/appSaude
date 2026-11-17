package com.br.appSaude.modules.medico;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface MedicoRepository extends JpaRepository<EntityJpaMedico, Long> {
    Optional<EntityJpaMedico> findByCpfMedico(String cpfMedico);
    boolean existsByCrmMedico(String crmMedico);
    List<EntityJpaMedico> findAllByOrderByNomeAsc();
    List<EntityJpaMedico> findByEspecialidadeMedicoIgnoreCaseOrderByNomeAsc(String especialidadeMedico);
}
