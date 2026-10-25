package com.br.appSaude.modules.medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;
public interface MedicoRepository extends JpaRepository<EntityJpaMedico,Long> {
 Optional<EntityJpaMedico> findByCpfMedico(String cpfMedico);
 List<EntityJpaMedico> findAllByOrderByNomeAsc();
 List<EntityJpaMedico> findByEspecialidadeMedicoIgnoreCaseOrderByNomeAsc(String especialidadeMedico);
 @Query("select distinct m.especialidadeMedico from EntityJpaMedico m where m.especialidadeMedico is not null and trim(m.especialidadeMedico) <> '' order by m.especialidadeMedico")
 List<String> findDistinctEspecialidades();
}