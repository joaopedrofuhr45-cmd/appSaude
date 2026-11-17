package com.br.appSaude.modules.paciente;

import com.br.appSaude.modules.paciente.dto.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import com.br.appSaude.modules.auth.dto.AlterarSenhaRequest;

import java.util.List;
import java.time.LocalDate;

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

    @PatchMapping("/perfil/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(@AuthenticationPrincipal UserDetails usuario,
                             @Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(usuario.getUsername(), request.senhaAtual(), request.novaSenha());
    }

    @GetMapping("/consultas")
    public List<ConsultaPacienteResponse> consultas(@AuthenticationPrincipal UserDetails usuario,
            @RequestParam(required = false) String status) {
        return service.listarConsultas(usuario.getUsername(), status);
    }

    @GetMapping("/consultas/horarios-indisponiveis")
    public List<String> horariosIndisponiveis(@RequestParam Long medicoId, @RequestParam LocalDate data) {
        return service.horariosIndisponiveis(medicoId, data);
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

    @PutMapping("/consultas/{id}")
    public ConsultaPacienteResponse reagendar(@AuthenticationPrincipal UserDetails usuario,
            @PathVariable Long id, @Valid @RequestBody AgendarConsultaRequest request) {
        return service.reagendar(usuario.getUsername(), id, request);
    }

    @DeleteMapping("/consultas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@AuthenticationPrincipal UserDetails usuario, @PathVariable Long id) {
        service.cancelar(usuario.getUsername(), id);
    }
}
