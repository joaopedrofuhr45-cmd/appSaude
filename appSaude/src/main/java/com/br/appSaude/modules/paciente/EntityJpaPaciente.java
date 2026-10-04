package com.br.appSaude.modules.paciente;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "paciente")
public class EntityJpaPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPaciente")
    private Long id;

    @Column(name = "nomePaciente", length = 150, nullable = false)
    private String nome;

    @Column(name = "emailPaciente", length = 150, nullable = false, unique = true)
    private String email;

    @Column(name = "senhaPaciente", length = 255, nullable = false)
    private String senha;

    @Column(name = "telefonePaciente", length = 20)
    private String telefonePaciente;

    @Column(name = "cpfPaciente", length = 11, nullable = false, unique = true)
    private String cpfPaciente;

    @Column(name = "data_nascimentoPaciente")
    private LocalDate dataDeNascimento;

    @Column(name = "criado_emPaciente", insertable = false, updatable = false)
    private LocalDateTime criadoEmPaciente;

}
