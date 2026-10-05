package com.br.appSaude.modules.auth;

import com.br.appSaude.modules.auth.dto.LoginRequest;
import com.br.appSaude.modules.auth.dto.LoginResponse;
import com.br.appSaude.modules.auth.dto.UsuarioAutenticadoResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UsuarioAuthRepository repository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioAuthRepository repository,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.cpf(), request.senha()));
        UsuarioAuth usuario = repository.findByCpf(request.cpf())
                .orElseThrow(() -> new IllegalStateException("Conta autenticada não encontrada."));
        return new LoginResponse(jwtService.gerarToken(usuario), usuario.ge(),
                usuario.getPerfilId(), usuario.getRole());
    }

    public UsuarioAutenticadoResponse usuarioAtual(UsuarioAuth usuario) {
        return new UsuarioAutenticadoResponse(usuario.getId(), usuario.getPerfilId(), usuario.getRole());
    }
}
