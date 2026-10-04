package com.br.appSaude.modules.paciente;

import com.br.appSaude.modules.paciente.dto.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes")
@PreAuthorize("hasRole('USUARIO')")
public class PacienteController {
    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @GetMapping("/perfil")
    public PerfilPacienteResponse perfil(@AuthenticationPrincipal UserDetails usuario) {
        return service.perfil(usuario.getUsername());
    }

    @PutMapping("/perfil")
    public PerfilPacienteResponse atualizarPerfil(@AuthenticationPrincipal UserDetails usuario,
                                                   @Valid @RequestBody AtualizarPerfilRequest request) {
        return service.atualizarPerfil(usuario.getUsername(), request);
    }

    @GetMapping("/consultas")
    public List<ConsultaPacienteResponse> consultas(@AuthenticationPrincipal UserDetails usuario) {
        return service.listarConsultas(usuario.getUsername());
    }

    @GetMapping("/consultas/{id}")
    public ConsultaPacienteResponse consulta(@AuthenticationPrincipal UserDetails usuario,
                                             @PathVariable Long id) {
        return service.buscarConsulta(usuario.getUsername(), id);
    }

    @PostMapping("/consultas")
    public ConsultaPacienteResponse agendar(@AuthenticationPrincipal UserDetails usuario,
                                            @Valid @RequestBody AgendarConsultaRequest request) {
        return service.agendar(usuario.getUsername(), request);
    }

    @DeleteMapping("/consultas/{id}")
    public void cancelar(@AuthenticationPrincipal UserDetails usuario, @PathVariable Long id) {
        service.cancelar(usuario.getUsername(), id);
    }
}
