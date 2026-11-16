package com.br.appSaude.modules.medico;

import com.br.appSaude.modules.medico.dto.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/medicos")
public class MedicoController {
    private final MedicoService service;

    public MedicoController(MedicoService service) {
        this.service = service;
    }

    @GetMapping
    public List<MedicoPublicoResponse> listarPublico(@RequestParam(required = false) String especialidade) {
        return service.listarPublico(especialidade);
    }

    @GetMapping("/especialidades")
    public List<String> especialidades() {
        return service.listarEspecialidades();
    }

    @GetMapping("/perfil")
    @PreAuthorize("hasRole('MEDICO')")
    public MedicoPerfilResponse perfil(@AuthenticationPrincipal UserDetails usuario) {
        return service.perfil(usuario.getUsername());
    }

    @PutMapping("/perfil")
    @PreAuthorize("hasRole('MEDICO')")
    public MedicoPerfilResponse atualizarPerfil(@AuthenticationPrincipal UserDetails usuario,
                                                 @Valid @RequestBody AtualizarMedicoRequest request) {
        return service.atualizarPerfil(usuario.getUsername(), request);
    }

    @PatchMapping("/perfil/senha")
    @PreAuthorize("hasRole('MEDICO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(@AuthenticationPrincipal UserDetails usuario,
                             @Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(usuario.getUsername(), request.senhaAtual(), request.novaSenha());
    }

    @GetMapping("/consultas")
    @PreAuthorize("hasRole('MEDICO')")
    public List<ConsultaMedicoResponse> consultas(@AuthenticationPrincipal UserDetails usuario,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate data,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paciente) {
        return service.listarConsultas(usuario.getUsername(), data, status, paciente);
    }

    @GetMapping("/consultas/{id}")
    @PreAuthorize("hasRole('MEDICO')")
    public ConsultaMedicoResponse consulta(@AuthenticationPrincipal UserDetails usuario,
                                           @PathVariable Long id) {
        return service.buscarConsulta(usuario.getUsername(), id);
    }

    @PatchMapping("/consultas/{id}/finalizar")
    @PreAuthorize("hasRole('MEDICO')")
    public ConsultaMedicoResponse finalizar(@AuthenticationPrincipal UserDetails usuario,
                                             @PathVariable Long id,
                                             @Valid @RequestBody FinalizarConsultaRequest request) {
        return service.finalizarConsulta(usuario.getUsername(), id, request);
    }
}
