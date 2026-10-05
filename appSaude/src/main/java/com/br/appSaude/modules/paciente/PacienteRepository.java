package com.br.appSaude.modules.paciente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<EntityJpaPaciente, Long> {
    Optional<EntityJpaPaciente> findByCpfPaciente(String cpfPaciente);
}