package com.br.appSaude.modules.auth;

import com.br.appSaude.modules.atendente.AtendenteRepository;
import com.br.appSaude.modules.atendente.EntittyJpaAtendente;
import com.br.appSaude.modules.medico.EntityJpaMedico;
import com.br.appSaude.modules.medico.MedicoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(prefix = "app.test-accounts", name = "enabled", havingValue = "true")
public class TestAccountsInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(TestAccountsInitializer.class);

    private final AtendenteRepository atendenteRepository;
    private final MedicoRepository medicoRepository;
    private final UsuarioAuthRepository usuarioAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final String atendenteCpf;
    private final String atendentePassword;
    private final String medicoCpf;
    private final String medicoPassword;

    public TestAccountsInitializer(
            AtendenteRepository atendenteRepository,
            MedicoRepository medicoRepository,
            UsuarioAuthRepository usuarioAuthRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.test-accounts.attendant-cpf:}") String atendenteCpf,
            @Value("${app.test-accounts.attendant-password:}") String atendentePassword,
            @Value("${app.test-accounts.doctor-cpf:}") String medicoCpf,
            @Value("${app.test-accounts.doctor-password:}") String medicoPassword) {
        this.atendenteRepository = atendenteRepository;
        this.medicoRepository = medicoRepository;
        this.usuarioAuthRepository = usuarioAuthRepository;
        this.passwordEncoder = passwordEncoder;
        this.atendenteCpf = atendenteCpf;
        this.atendentePassword = atendentePassword;
        this.medicoCpf = medicoCpf;
        this.medicoPassword = medicoPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        validarCredenciais(atendenteCpf, atendentePassword, "atendente");
        validarCredenciais(medicoCpf, medicoPassword, "médico");
        if (atendenteCpf.equals(medicoCpf)) {
            throw new IllegalStateException("As contas de teste de médico e atendente precisam de CPFs diferentes.");
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

        provisionarConta(atendenteCpf, atendentePassword, Role.ATENDENTE, atendente.getIdAtendente());
        provisionarConta(medicoCpf, medicoPassword, Role.MEDICO, medico.getId());
        log.info("Contas de teste de médico e atendente foram preparadas.");
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
