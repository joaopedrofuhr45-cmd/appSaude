package com.br.appSaude.modules.medico.dto;

public record MedicoPerfilResponse(Long id, String nome, String cpf,
                                   String especialidade, String crm) {}
