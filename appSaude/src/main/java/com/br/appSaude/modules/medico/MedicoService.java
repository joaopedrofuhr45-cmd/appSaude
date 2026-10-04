package com.br.appSaude.modules.medico;

import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.medico.dto.AtualizarMedicoRequest;
import com.br.appSaude.modules.medico.dto.ConsultaMedicoResponse;
import com.br.appSaude.modules.medico.dto.FinalizarConsultaRequest;
import com.br.appSaude.modules.medico.dto.MedicoPerfilResponse;
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

    public MedicoService(MedicoRepository medicoRepository,
                         MedicoConsultaRepository consultaRepository,
                         PasswordEncoder passwordEncoder) {
        this.medicoRepository = medicoRepository;
        this.consultaRepository = consultaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public MedicoPerfilResponse perfil(String cpf) {
        return toPerfil(buscarMedico(cpf));
    }

    @Transactional
    public MedicoPerfilResponse atualizarPerfil(String cpf, AtualizarMedicoRequest request) {
        EntityJpaMedico medico = buscarMedico(cpf);
        medico.setNome(request.nome().trim());
        medico.setEspecialidadeMedico(request.especialidade());
        medico.setCrmMedico(request.crm());
        return toPerfil(medicoRepository.save(medico));
    }

    @Transactional
    public void alterarSenha(String cpf, String senhaAtual, String novaSenha) {
        EntityJpaMedico medico = buscarMedico(cpf);
        if (!passwordEncoder.matches(senhaAtual, medico.getSenha())) {
            throw new IllegalArgumentException("A senha atual está incorreta.");
        }
        medico.setSenha(passwordEncoder.encode(novaSenha));
        medicoRepository.save(medico);
    }

    @Transactional(readOnly = true)
    public List<ConsultaMedicoResponse> listarConsultas(String cpf) {
        Long medicoId = buscarMedico(cpf).getId();
        return consultaRepository.findByMedico_IdOrderByDataConsultaAscHoraConsultaAsc(medicoId)
                .stream().map(this::toConsulta).toList();
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
                medico.getEspecialidadeMedico(), medico.getCrmMedico());
    }

    private ConsultaMedicoResponse toConsulta(EntityJpaConsultas consulta) {
        return new ConsultaMedicoResponse(consulta.getIdConsulta(), consulta.getDataConsulta(),
                consulta.getHoraConsulta(), consulta.getStatusConsulta(), consulta.getObservacoesConsulta(),
                consulta.getPaciente().getId(), consulta.getPaciente().getNome());
    }
}
