package com.br.appSaude.modules.atendente;

import com.br.appSaude.modules.atendente.dto.AlterarSenhaRequest;
import com.br.appSaude.modules.atendente.dto.AtendentePerfilResponse;
import com.br.appSaude.modules.atendente.dto.AtualizarAtendenteRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/atendentes")
@PreAuthorize("hasRole('ATENDENTE')")
public class AtendenteController {
    private final AtendenteService service;

    public AtendenteController(AtendenteService service) {
        this.service = service;
    }

    @GetMapping("/perfil")
    public AtendentePerfilResponse perfil(@AuthenticationPrincipal UserDetails usuario) {
        return service.buscarPerfil(usuario.getUsername());
    }

    @PutMapping("/perfil")
    public AtendentePerfilResponse atualizarPerfil(@AuthenticationPrincipal UserDetails usuario,
                                                    @Valid @RequestBody AtualizarAtendenteRequest request) {
        return service.atualizarPerfil(usuario.getUsername(), request);
    }

    @PatchMapping("/perfil/senha")
    public void alterarSenha(@AuthenticationPrincipal UserDetails usuario,
                             @Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(usuario.getUsername(), request);
    }
}
