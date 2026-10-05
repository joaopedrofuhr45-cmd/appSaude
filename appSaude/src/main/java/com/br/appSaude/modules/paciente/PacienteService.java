package com.br.appSaude.modules.paciente;

import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.medico.EntityJpaMedico;
import com.br.appSaude.modules.medico.MedicoRepository;
import com.br.appSaude.modules.paciente.dto.AgendarConsultaRequest;
import com.br.appSaude.modules.paciente.dto.AtualizarPerfilRequest;
import com.br.appSaude.modules.paciente.dto.ConsultaPacienteResponse;
import com.br.appSaude.modules.paciente.dto.PerfilPacienteResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PacienteService {
    private final PacienteRepository pacienteRepository;
    private final PacienteConsultaRepository consultaRepository;
    private final MedicoRepository medicoRepository;

    public PacienteService(PacienteRepository pacienteRepository,
                           PacienteConsultaRepository consultaRepository,
                           MedicoRepository medicoRepository) {
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional(readOnly = true)
    public PerfilPacienteResponse perfil(String cpf) {
        return toPerfil(buscarPaciente(cpf));
    }

    @Transactional
    public PerfilPacienteResponse atualizarPerfil(String cpf, AtualizarPerfilRequest request) {
        EntityJpaPaciente paciente = buscarPaciente(cpf);
        paciente.setNome(request.nome().trim());
        paciente.setEmail(request.email().trim().toLowerCase());
        paciente.setTelefonePaciente(request.telefone());
        return toPerfil(pacienteRepository.save(paciente));
    }

    @Transactional(readOnly = true)
    public List<ConsultaPacienteResponse> listarConsultas(String cpf) {
        Long pacienteId = buscarPaciente(cpf).getId();
        return consultaRepository.findByPaciente_IdOrderByDataConsultaDescHoraConsultaDesc(pacienteId)
                .stream().map(this::toConsulta).toList();
    }

    @Transactional(readOnly = true)
    public ConsultaPacienteResponse buscarConsulta(String cpf, Long consultaId) {
        Long pacienteId = buscarPaciente(cpf).getId();
        return toConsulta(buscarConsultaDoPaciente(consultaId, pacienteId));
    }

    @Transactional
    public ConsultaPacienteResponse agendar(String cpf, AgendarConsultaRequest request) {
        EntityJpaPaciente paciente = buscarPaciente(cpf);
        EntityJpaMedico medico = medicoRepository.findById(request.medicoId())
                .orElseThrow(() -> new EntityNotFoundException("Médico não encontrado."));
        if (consultaRepository.existsByMedico_IdAndDataConsultaAndHoraConsulta(
                medico.getId(), request.data(), request.hora())) {
            throw new IllegalStateException("O médico já possui uma consulta nesse horário.");
        }

        EntityJpaConsultas consulta = EntityJpaConsultas.builder()
                .dataConsulta(request.data())
                .horaConsulta(request.hora())
                .statusConsulta("AGENDADA")
                .observacoesConsulta(request.observacoes())
                .paciente(paciente)
                .medico(medico)
                .build();
        return toConsulta(consultaRepository.save(consulta));
    }

    @Transactional
    public void cancelar(String cpf, Long consultaId) {
        Long pacienteId = buscarPaciente(cpf).getId();
        EntityJpaConsultas consulta = buscarConsultaDoPaciente(consultaId, pacienteId);
        if ("REALIZADA".equalsIgnoreCase(consulta.getStatusConsulta())) {
            throw new IllegalStateException("Uma consulta realizada não pode ser cancelada.");
        }
        consulta.setStatusConsulta("CANCELADA");
        consultaRepository.save(consulta);
    }

    private EntityJpaPaciente buscarPaciente(String cpf) {
        return pacienteRepository.findByCpfPaciente(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado."));
    }

    private EntityJpaConsultas buscarConsultaDoPaciente(Long consultaId, Long pacienteId) {
        return consultaRepository.findByIdConsultaAndPaciente_Id(consultaId, pacienteId)
                .orElseThrow(() -> new EntityNotFoundException("Consulta não encontrada para este usuário."));
    }

    private PerfilPacienteResponse toPerfil(EntityJpaPaciente paciente) {
        return new PerfilPacienteResponse(paciente.getId(), paciente.getNome(), paciente.getEmail(),
                paciente.getCpfPaciente(), paciente.getTelefonePaciente());
    }

    private ConsultaPacienteResponse toConsulta(EntityJpaConsultas consulta) {
        return new ConsultaPacienteResponse(consulta.getIdConsulta(), consulta.getDataConsulta(),
                consulta.getHoraConsulta(), consulta.getStatusConsulta(), consulta.getObservacoesConsulta(),
                consulta.getMedico().getId(), consulta.getMedico().getNome(),
                consulta.getMedico().getEspecialidadeMedico());
    }
}