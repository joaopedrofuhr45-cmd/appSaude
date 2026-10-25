package com.br.appSaude.modules.medico;

import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.auth.UsuarioAuthRepository;
import com.br.appSaude.modules.medico.dto.AtualizarMedicoRequest;
import com.br.appSaude.modules.medico.dto.ConsultaMedicoResponse;
import com.br.appSaude.modules.medico.dto.FinalizarConsultaRequest;
import com.br.appSaude.modules.medico.dto.MedicoPerfilResponse;
import com.br.appSaude.modules.medico.dto.MedicoPublicoResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicoService {
    private final MedicoRepository medicoRepository;
    private final MedicoConsultaRepository consultaRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioAuthRepository usuarioAuthRepository;

    public MedicoService(MedicoRepository medicoRepository,
                         MedicoConsultaRepository consultaRepository,
                         PasswordEncoder passwordEncoder,
                         UsuarioAuthRepository usuarioAuthRepository) {
        this.medicoRepository = medicoRepository;
        this.consultaRepository = consultaRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioAuthRepository = usuarioAuthRepository;
    }

    @Transactional(readOnly = true)
    public MedicoPerfilResponse perfil(String cpf) {
        return toPerfil(buscarMedico(cpf));
    }

    @Transactional(readOnly = true)
    public List<MedicoPublicoResponse> listarPublico(String especialidade) {
        var medicos = especialidade == null || especialidade.isBlank()
                ? medicoRepository.findAllByOrderByNomeAsc()
                : medicoRepository.findByEspecialidadeMedicoIgnoreCaseOrderByNomeAsc(especialidade);
        return medicos.stream().map(m -> new MedicoPublicoResponse(
                m.getId(), m.getNome(), m.getEspecialidadeMedico(), m.getCrmMedico())).toList();
    }

    @Transactional(readOnly = true)
    public List<String> listarEspecialidades() {
        return medicoRepository.findDistinctEspecialidades();
    }

    @Transactional
    public MedicoPerfilResponse atualizarPerfil(String cpf, AtualizarMedicoRequest request) {
        EntityJpaMedico medico = buscarMedico(cpf);
        medico.setNome(request.nome().trim());
        medico.setEspecialidadeMedico(request.especialidade());
        medico.setCrmMedico(request.crm());
        medico.setEmail(request.email());
        medico.setTelefone(request.telefone());
        return toPerfil(medicoRepository.save(medico));
    }

    @Transactional
    public void alterarSenha(String cpf, String senhaAtual, String novaSenha) {
        EntityJpaMedico medico = buscarMedico(cpf);
        var usuario = usuarioAuthRepository.findByCpf(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Conta do médico não encontrada."));
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenhaHash())) {
            throw new IllegalArgumentException("A senha atual está incorreta.");
        }
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioAuthRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public List<ConsultaMedicoResponse> listarConsultas(String cpf, java.time.LocalDate data,
                                                         String status, String paciente) {
        Long medicoId = buscarMedico(cpf).getId();
        String nomePaciente = paciente == null || paciente.isBlank() ? null : paciente.trim();
        return consultaRepository.buscarAgenda(medicoId, data, status, nomePaciente);
    }

    @Transactional(readOnly = true)
    public ConsultaMedicoResponse buscarConsulta(String cpf, Long consultaId) {
        Long medicoId = buscarMedico(cpf).getId();
        return toConsulta(buscarConsultaDoMedico(consultaId, medicoId));
    }

    @Transactional
    public ConsultaMedicoResponse finalizarConsulta(String cpf, Long consultaId,
                                                    FinalizarConsultaRequest request) {
        Long medicoId = buscarMedico(cpf).getId();
        EntityJpaConsultas consulta = buscarConsultaDoMedico(consultaId, medicoId);
        if ("CANCELADA".equalsIgnoreCase(consulta.getStatusConsulta())) {
            throw new IllegalStateException("Uma consulta cancelada não pode ser finalizada.");
        }
        if ("REALIZADA".equalsIgnoreCase(consulta.getStatusConsulta())) {
            throw new IllegalStateException("Esta consulta já foi finalizada.");
        }
        consulta.setObservacoesConsulta(request.observacoes().trim());
        consulta.setStatusConsulta("REALIZADA");
        return toConsulta(consultaRepository.save(consulta));
    }

    private EntityJpaMedico buscarMedico(String cpf) {
        return medicoRepository.findByCpfMedico(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Médico não encontrado."));
    }

    private EntityJpaConsultas buscarConsultaDoMedico(Long consultaId, Long medicoId) {
        return consultaRepository.findByIdConsultaAndMedico_Id(consultaId, medicoId)
                .orElseThrow(() -> new EntityNotFoundException("Consulta não encontrada para este médico."));
    }

    private MedicoPerfilResponse toPerfil(EntityJpaMedico medico) {
        return new MedicoPerfilResponse(medico.getId(), medico.getNome(), medico.getCpfMedico(),
                medico.getEspecialidadeMedico(), medico.getCrmMedico(), medico.getEmail(), medico.getTelefone());
    }

    private ConsultaMedicoResponse toConsulta(EntityJpaConsultas consulta) {
        return new ConsultaMedicoResponse(consulta.getIdConsulta(), consulta.getDataConsulta(),
                consulta.getHoraConsulta(), consulta.getStatusConsulta(), consulta.getObservacoesConsulta(),
                consulta.getPaciente().getId(), consulta.getPaciente().getNome(),
                consulta.getMedico().getEspecialidadeMedico());
    }
}
