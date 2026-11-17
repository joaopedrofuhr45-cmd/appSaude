package com.br.appSaude.modules.auth;

import com.br.appSaude.modules.atendente.AtendenteRepository;
import com.br.appSaude.modules.atendente.EntittyJpaAtendente;
import com.br.appSaude.modules.medico.EntityJpaMedico;
import com.br.appSaude.modules.medico.MedicoRepository;
import com.br.appSaude.modules.consultas.EntityJpaConsultas;
import com.br.appSaude.modules.paciente.EntityJpaPaciente;
import com.br.appSaude.modules.paciente.PacienteConsultaRepository;
import com.br.appSaude.modules.paciente.PacienteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Component
@ConditionalOnProperty(prefix = "app.test-accounts", name = "enabled", havingValue = "true")
public class TestAccountsInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(TestAccountsInitializer.class);

    private final AtendenteRepository atendenteRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final PacienteConsultaRepository consultaRepository;
    private final UsuarioAuthRepository usuarioAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final String atendenteCpf;
    private final String atendentePassword;
    private final String medicoCpf;
    private final String medicoPassword;
    private final String pacienteCpf;
    private final String pacientePassword;

    public TestAccountsInitializer(
            AtendenteRepository atendenteRepository,
            MedicoRepository medicoRepository,
            PacienteRepository pacienteRepository,
            PacienteConsultaRepository consultaRepository,
            UsuarioAuthRepository usuarioAuthRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.test-accounts.attendant-cpf:}") String atendenteCpf,
            @Value("${app.test-accounts.attendant-password:}") String atendentePassword,
            @Value("${app.test-accounts.doctor-cpf:}") String medicoCpf,
            @Value("${app.test-accounts.doctor-password:}") String medicoPassword,
            @Value("${app.test-accounts.patient-cpf:}") String pacienteCpf,
            @Value("${app.test-accounts.patient-password:}") String pacientePassword) {
        this.atendenteRepository = atendenteRepository;
        this.medicoRepository = medicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
        this.usuarioAuthRepository = usuarioAuthRepository;
        this.passwordEncoder = passwordEncoder;
        this.atendenteCpf = atendenteCpf;
        this.atendentePassword = atendentePassword;
        this.medicoCpf = medicoCpf;
        this.medicoPassword = medicoPassword;
        this.pacienteCpf = pacienteCpf;
        this.pacientePassword = pacientePassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        validarCredenciais(atendenteCpf, atendentePassword, "atendente");
        validarCredenciais(medicoCpf, medicoPassword, "médico");
        validarCredenciais(pacienteCpf, pacientePassword, "paciente");
        if (atendenteCpf.equals(medicoCpf) || atendenteCpf.equals(pacienteCpf) || medicoCpf.equals(pacienteCpf)) {
            throw new IllegalStateException("As contas de teste precisam usar CPFs diferentes.");
        }

        EntittyJpaAtendente atendente = atendenteRepository.findByCpfAtendente(atendenteCpf)
                .orElseGet(() -> atendenteRepository.save(EntittyJpaAtendente.builder()
                        .cpfAtendente(atendenteCpf)
                        .nomeAtendente("Atendente de Teste")
                        .build()));
        EntityJpaMedico medico = medicoRepository.findByCpfMedico(medicoCpf)
                .orElseGet(() -> medicoRepository.save(EntityJpaMedico.builder()
                        .cpfMedico(medicoCpf)
                        .nome("Médico de Teste")
                        .especialidadeMedico("Clínico geral")
                        .crmMedico("CRM-TST-" + medicoCpf)
                        .build()));
        EntityJpaPaciente paciente = pacienteRepository.findByCpfPaciente(pacienteCpf)
                .orElseGet(() -> pacienteRepository.save(EntityJpaPaciente.builder()
                        .cpfPaciente(pacienteCpf)
                        .nome("Paciente de Teste")
                        .email("paciente.teste." + pacienteCpf + "@appsaude.local")
                        .telefonePaciente("11999990000")
                        .build()));

        provisionarConta(atendenteCpf, atendentePassword, Role.ATENDENTE, atendente.getIdAtendente());
        provisionarConta(medicoCpf, medicoPassword, Role.MEDICO, medico.getId());
        provisionarConta(pacienteCpf, pacientePassword, Role.USUARIO, paciente.getId());
        prepararConsultaDemonstracao(paciente, medico);
        log.info("Contas de teste e consulta compartilhada de paciente, médico e atendente foram preparadas.");
    }

    private void prepararConsultaDemonstracao(EntityJpaPaciente paciente, EntityJpaMedico medico) {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        if (consultaRepository.existsByPaciente_IdAndMedico_IdAndDataConsultaGreaterThanEqualAndStatusConsultaNot(
                paciente.getId(), medico.getId(), hoje, "CANCELADA")) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
        List<LocalTime> horarios = List.of(
                LocalTime.of(8, 0), LocalTime.of(8, 30), LocalTime.of(9, 0), LocalTime.of(9, 30),
                LocalTime.of(10, 0), LocalTime.of(10, 30), LocalTime.of(11, 0), LocalTime.of(11, 30),
                LocalTime.of(13, 0), LocalTime.of(13, 30), LocalTime.of(14, 0), LocalTime.of(14, 30),
                LocalTime.of(15, 0), LocalTime.of(15, 30), LocalTime.of(16, 0), LocalTime.of(16, 30),
                LocalTime.of(17, 0), LocalTime.of(17, 30));

        for (int diasAdiante = 0; diasAdiante < 31; diasAdiante++) {
            LocalDate data = hoje.plusDays(diasAdiante);
            for (LocalTime hora : horarios) {
                if (!LocalDateTime.of(data, hora).isAfter(agora)) {
                    continue;
                }
                boolean ocupado = consultaRepository.existsByMedico_IdAndDataConsultaAndHoraConsultaAndStatusConsultaNot(
                        medico.getId(), data, hora, "CANCELADA");
                if (ocupado) {
                    continue;
                }

                consultaRepository.save(EntityJpaConsultas.builder()
                        .dataConsulta(data)
                        .horaConsulta(hora)
                        .statusConsulta("AGENDADA")
                        .observacoesConsulta("Consulta de demonstração para testar a integração dos perfis.")
                        .paciente(paciente)
                        .medico(medico)
                        .build());
                return;
            }
        }

        log.warn("Não foi possível encontrar um horário para a consulta de demonstração.");
    }

    private void validarCredenciais(String cpf, String senha, String perfil) {
        if (cpf == null || !cpf.matches("\\d{11}")) {
            throw new IllegalStateException("Configure um CPF de 11 dígitos para a conta de teste de " + perfil + ".");
        }
        if (senha == null || senha.length() < 12) {
            throw new IllegalStateException("Configure uma senha de pelo menos 12 caracteres para a conta de teste de " + perfil + ".");
        }
    }

    private void provisionarConta(String cpf, String senha, Role role, Long perfilId) {
        UsuarioAuth usuario = usuarioAuthRepository.findByCpf(cpf).orElseGet(UsuarioAuth::new);
        if (usuario.getId() != null && usuario.getRole() != role) {
            throw new IllegalStateException("O CPF configurado para teste já pertence a outro tipo de conta.");
        }
        if (usuario.getId() != null && !perfilId.equals(usuario.getPerfilId())) {
            throw new IllegalStateException("O CPF configurado para teste já está associado a outro perfil.");
        }

        usuario.setCpf(cpf);
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setRole(role);
        usuario.setPerfilId(perfilId);
        usuarioAuthRepository.save(usuario);
    }
}
