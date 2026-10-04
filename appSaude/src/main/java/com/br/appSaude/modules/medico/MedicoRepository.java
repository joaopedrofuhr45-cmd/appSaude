package com.br.appSaude.modules.medico;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicoRepository extends JpaRepository<EntityJpaMedico, Long> {
    Optional<EntityJpaMedico> findByCpfMedico(String cpfMedico);
}
