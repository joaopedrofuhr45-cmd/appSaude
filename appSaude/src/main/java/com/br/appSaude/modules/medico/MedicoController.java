package com.br.appSaude.modules.medico;

import com.br.appSaude.modules.medico.dto.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicos")
@PreAuthorize("hasRole('MEDICO')")
public class MedicoController {
    private final MedicoService service;

    public MedicoController(MedicoService service) {
        this.service = service;
    }

    @GetMapping("/perfil")
    public MedicoPerfilResponse perfil(@AuthenticationPrincipal UserDetails usuario) {
        return service.perfil(usuario.getUsername());
    }

    @PutMapping("/perfil")
    public MedicoPerfilResponse atualizarPerfil(@AuthenticationPrincipal UserDetails usuario,
                                                 @Valid @RequestBody AtualizarMedicoRequest request) {
        return service.atualizarPerfil(usuario.getUsername(), request);
    }

    @PatchMapping("/perfil/senha")
    public void alterarSenha(@AuthenticationPrincipal UserDetails usuario,
                             @Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(usuario.getUsername(), request.senhaAtual(), request.novaSenha());
    }

    @GetMapping("/consultas")
    public List<ConsultaMedicoResponse> consultas(@AuthenticationPrincipal UserDetails usuario) {
        return service.listarConsultas(usuario.getUsername());
    }

    @GetMapping("/consultas/{id}")
    public ConsultaMedicoResponse consulta(@AuthenticationPrincipal UserDetails usuario,
                                           @PathVariable Long id) {
        return service.buscarConsulta(usuario.getUsername(), id);
    }

    @PatchMapping("/consultas/{id}/finalizar")
    public ConsultaMedicoResponse finalizar(@AuthenticationPrincipal UserDetails usuario,
                                             @PathVariable Long id,
                                             @Valid @RequestBody FinalizarConsultaRequest request) {
        return service.finalizarConsulta(usuario.getUsername(), id, request);
    }
}
