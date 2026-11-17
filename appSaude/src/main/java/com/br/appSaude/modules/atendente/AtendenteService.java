package com.br.appSaude.modules.atendente;

import com.br.appSaude.modules.atendente.dto.AlterarSenhaRequest;
import com.br.appSaude.modules.atendente.dto.AtendentePerfilResponse;
import com.br.appSaude.modules.atendente.dto.AtualizarAtendenteRequest;
import com.br.appSaude.modules.atendente.dto.ConsultaAtendenteResponse;
import com.br.appSaude.modules.auth.UsuarioAuthRepository;
import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AtendenteService {
    private final AtendenteRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioAuthRepository usuarioAuthRepository;
    private final AtendenteConsultaRepository consultaRepository;

    public AtendenteService(AtendenteRepository repository, PasswordEncoder passwordEncoder,
                            UsuarioAuthRepository usuarioAuthRepository,
                            AtendenteConsultaRepository consultaRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioAuthRepository = usuarioAuthRepository;
        this.consultaRepository = consultaRepository;
    }

    @Transactional(readOnly = true)
    public List<ConsultaAtendenteResponse> listarConsultas(String status, LocalDate data, String paciente) {
        String nomePaciente = paciente == null || paciente.isBlank() ? null : paciente.trim();
        return consultaRepository.buscarAgenda(status, data, nomePaciente);
    }

    @Transactional(readOnly = true)
    public ConsultaAtendenteResponse buscarConsulta(Long id) {
        return consultaRepository.findById(id).map(this::toConsulta)
                .orElseThrow(() -> new EntityNotFoundException("Consulta não encontrada."));
    }

    @Transactional(readOnly = true)
    public AtendentePerfilResponse buscarPerfil(String cpfAutenticado) {
        return toResponse(buscarPorCpf(cpfAutenticado));
    }

    @Transactional
    public AtendentePerfilResponse atualizarPerfil(String cpfAutenticado, AtualizarAtendenteRequest request) {
        EntittyJpaAtendente atendente = buscarPorCpf(cpfAutenticado);
        atendente.setNomeAtendente(request.nome().trim());
        atendente.setEmail(request.email());
        atendente.setTelefone(request.telefone());
        return toResponse(repository.save(atendente));
    }

    @Transactional
    public void alterarSenha(String cpfAutenticado, AlterarSenhaRequest request) {
        EntittyJpaAtendente atendente = buscarPorCpf(cpfAutenticado);
        var usuario = usuarioAuthRepository.findByCpf(atendente.getCpfAtendente())
                .orElseThrow(() -> new EntityNotFoundException("Conta do atendente não encontrada."));
        if (!passwordEncoder.matches(request.senhaAtual(), usuario.getSenhaHash())) {
            throw new IllegalArgumentException("A senha atual está incorreta.");
        }
        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        usuarioAuthRepository.save(usuario);
    }

    private EntittyJpaAtendente buscarPorCpf(String cpf) {
        return repository.findByCpfAtendente(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Atendente não encontrado."));
    }

    private AtendentePerfilResponse toResponse(EntittyJpaAtendente atendente) {
        return new AtendentePerfilResponse(atendente.getIdAtendente(), atendente.getNomeAtendente(),
                atendente.getCpfAtendente(), atendente.getEmail(), atendente.getTelefone());
    }

    private ConsultaAtendenteResponse toConsulta(EntityJpaConsultas consulta) {
        return new ConsultaAtendenteResponse(consulta.getIdConsulta(), consulta.getDataConsulta(),
                consulta.getHoraConsulta(), consulta.getStatusConsulta(), consulta.getObservacoesConsulta(),
                consulta.getPaciente().getId(), consulta.getPaciente().getNome(),
                consulta.getMedico().getId(), consulta.getMedico().getNome(),
                consulta.getMedico().getEspecialidadeMedico());
    }
}
