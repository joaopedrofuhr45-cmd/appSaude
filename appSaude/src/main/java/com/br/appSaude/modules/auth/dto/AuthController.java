package com.br.appSaude.modules.auth;

import com.br.appSaude.modules.auth.dto.LoginRequest;
import com.br.appSaude.modules.auth.dto.LoginResponse;
import com.br.appSaude.modules.auth.dto.UsuarioAutenticadoResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UsuarioAutenticadoResponse usuarioAtual(@AuthenticationPrincipal UsuarioAuth usuario) {
        return authService.usuarioAtual(usuario);
    }
}
