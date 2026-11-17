package com.br.appSaude.modules.medico.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CriarMedicoRequest(
        @NotBlank @Size(max = 155) String nome,
        @NotBlank @Pattern(regexp = "[0-9]{11}") String cpf,
        @NotBlank @Size(max = 100) String especialidade,
        @NotBlank @Size(max = 20) String crm,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 20) String telefone,
        @NotBlank @Size(min = 8, max = 72) String senha
) {}
