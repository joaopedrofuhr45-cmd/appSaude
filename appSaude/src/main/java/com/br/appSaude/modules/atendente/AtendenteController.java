package com.br.appSaude.modules.atendente;

import com.br.appSaude.modules.atendente.dto.AlterarSenhaRequest;
import com.br.appSaude.modules.atendente.dto.AtendentePerfilResponse;
import com.br.appSaude.modules.atendente.dto.AtualizarAtendenteRequest;
import com.br.appSaude.modules.atendente.dto.ConsultaAtendenteResponse;
import com.br.appSaude.modules.medico.MedicoService;
import com.br.appSaude.modules.medico.dto.CriarMedicoRequest;
import com.br.appSaude.modules.medico.dto.MedicoPublicoResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/atendentes")
@PreAuthorize("hasRole('ATENDENTE')")
public class AtendenteController {
    private final AtendenteService service;
    private final MedicoService medicoService;

    public AtendenteController(AtendenteService service, MedicoService medicoService) {
        this.service = service;
        this.medicoService = medicoService;
    }

    @PostMapping("/medicos")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicoPublicoResponse cadastrarMedico(@Valid @RequestBody CriarMedicoRequest request) {
        return medicoService.cadastrar(request);
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
