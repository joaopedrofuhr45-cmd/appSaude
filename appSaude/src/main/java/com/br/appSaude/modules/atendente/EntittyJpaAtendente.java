package com.br.appSaude.modules.atendente;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Atendente")
public class EntittyJpaAtendente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idAtendente")
    private Long idAtendente;

    @Column(name = "cpfAtendente", length = 11, nullable = false)
    private String cpfAtendente;

    @Column(name = "senhaAtendente", length = 255, nullable = false)
    private String senhaAtendente;

    @Column(name = "nomeAtendente", length = 150, nullable = false)
    private String nomeAtendente;
}
