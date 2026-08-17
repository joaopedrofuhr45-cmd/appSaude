package com.br.appSaude.modules.medico;


import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "medico")
public class EntityJpaMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(length = 150, nullable = false)
    private String nome;

    @Column(length = 100)
    private String especialidadeMedico;

    @Column(length = 20)
    private String crmMedico;

    @Column(length = 16, nullable = false)
    private String senha;


    @Column(length = 11, nullable = false, unique = true)
    private String cpfMedico;


}
