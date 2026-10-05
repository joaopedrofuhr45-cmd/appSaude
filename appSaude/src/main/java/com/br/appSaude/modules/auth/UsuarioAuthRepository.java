package com.br.appSaude.modules.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioAuthRepository extends JpaRepository<UsuarioAuth, Long> {
    Optional<UsuarioAuth> findByCpf(String cpf);

}
