package com.br.appSaude.modules.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailsService implements UserDetailsService {
    private final UsuarioAuthRepository repository;

    public AuthUserDetailsService(UsuarioAuthRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new UsernameNotFoundException("Conta não encontrada."));
    }
}
