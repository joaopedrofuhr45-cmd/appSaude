package com.br.appSaude.modules.medico;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

/** Populates the in-memory development database with bookable demonstration doctors. */
@Configuration
@Profile("dev")
public class MedicosDemoInitializer {

    @Bean
    CommandLineRunner carregarMedicosDeDemonstracao(MedicoRepository medicoRepository) {
        return args -> {
            List<EntityJpaMedico> medicos = List.of(
                    medico("91000000001", "Mariana Costa", "Clínico geral", "CRM-SP 100001"),
                    medico("91000000006", "Lucas Carvalho", "Cardiologia", "CRM-SP 100006"),
                    medico("91000000011", "Isabela Castro", "Oftalmologia", "CRM-SP 100011"),
                    medico("91000000016", "Eduardo Teixeira", "Pediatria", "CRM-SP 100016")
            );

            for (EntityJpaMedico medico : medicos) {
                if (medicoRepository.findByCpfMedico(medico.getCpfMedico()).isEmpty()) {
                    medicoRepository.save(medico);
                }
            }
        };
    }

    private EntityJpaMedico medico(String cpf, String nome, String especialidade, String crm) {
        return EntityJpaMedico.builder()
                .cpfMedico(cpf)
                .nome(nome)
                .especialidadeMedico(especialidade)
                .crmMedico(crm)
                .email(nome.toLowerCase().replace(' ', '.') + "@appsaude.local")
                .build();
    }
}
