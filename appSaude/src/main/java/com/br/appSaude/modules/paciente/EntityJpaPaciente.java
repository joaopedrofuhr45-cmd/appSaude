package com.br.appSaude.modules.paciente;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "paciente")
public class EntityJpaPaciente {


    @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

    @Column(length = 150, nullable = false)
    private String nome;

    @Column(length = 150, nullable = false, unique = true)
    private String email;

    @Column(length = 16, nullable = false)
   private String senha;

   @Column(length = 20)
    private String telefonePaciente;

   @Column(length = 11, nullable = false, unique = true)
    private String cpfPaciente;

   private LocalDate dataDeNascimento;

   private LocalDateTime criadoEmPaciente;



}
