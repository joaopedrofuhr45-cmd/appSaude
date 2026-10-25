package com.br.appSaude.modules.atendente;

import com.br.appSaude.modules.atendente.dto.AlterarSenhaRequest;
import com.br.appSaude.modules.atendente.dto.AtendentePerfilResponse;
import com.br.appSaude.modules.atendente.dto.AtualizarAtendenteRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.atendente.dto.ConsultaAtendenteResponse;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/atendentes")
@PreAuthorize("hasRole('ATENDENTE')")
public class AtendenteController {
    private final AtendenteService service;

    public AtendenteController(AtendenteService service) {
        this.service = service;
    }

    @GetMapping("/consultas")
    public List<ConsultaAtendenteResponse> consultas(@RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) String paciente) {
        return service.listarConsultas(status, data, paciente);
    }

    @GetMapping("/consultas/{id}")
    public ConsultaAtendenteResponse consulta(@PathVariable Long id) {
        return service.buscarConsulta(id);
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
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(@AuthenticationPrincipal UserDetails usuario,
                             @Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(usuario.getUsername(), request);
    }
}
