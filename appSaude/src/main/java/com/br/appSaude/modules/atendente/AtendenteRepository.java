package com.br.appSaude.modules.atendente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AtendenteRepository extends JpaRepository<EntittyJpaAtendente, Long> {
    Optional<EntittyJpaAtendente> findByCpfAtendente(String cpfAtendente);
}
