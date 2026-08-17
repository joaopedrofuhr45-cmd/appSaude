package com.br.appSaude.modules.consultas;

import com.br.appSaude.modules.medico.EntityJpaMedico;
import com.br.appSaude.modules.paciente.EntityJpaPaciente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "consutlas")
public class EntityJpaConsultas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idConsulta")
    private Long idConsulta;

    @Column(name = "dataConsulta", nullable = false)
    private LocalDate dataConsulta;

    @Column(name = "horaConsulta", nullable = false)
    private LocalTime horaConsulta;

    @Column(name = "statusConsulta", length = 20)
    private String statusConsulta;

    @Column(name = "observacoesConsulta", columnDefinition = "TEXT")
    private String observacoesConsulta;

    @Column(name = "criado_emConsulta", updatable = false)
    private LocalDateTime criadoEmConsulta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pacientes_idPaciente", nullable = false)
    private EntityJpaPaciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_idMedico", nullable = false)
    private EntityJpaMedico medico;

}
