CREATE TABLE consulta (
                        idConsulta BIGINT AUTO_INCREMENT PRIMARY KEY,
                        dataConsulta DATE NOT NULL,
                        horaConsulta TIME NOT NULL,
                        statusConsulta VARCHAR(20),
                        observacoesConsulta TEXT,
                        criado_emConsulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        pacientes_idPaciente BIGINT NOT NULL,
                        medico_idMedico BIGINT NOT NULL,
                        atendente_idAtendente BIGINT NOT NULL, -- Adicionado a coluna do atendente

                        CONSTRAINT fk_consulta_paciente
                            FOREIGN KEY (pacientes_idPaciente) REFERENCES paciente(idPaciente)
                                ON DELETE CASCADE ON UPDATE CASCADE,

                        CONSTRAINT fk_consulta_medico
                            FOREIGN KEY (medico_idMedico) REFERENCES medico(idMedico)
                                ON DELETE CASCADE ON UPDATE CASCADE,

                        CONSTRAINT fk_consulta_atendente
                            FOREIGN KEY (atendente_idAtendente) REFERENCES atendente(idAtendente)
                                ON DELETE CASCADE ON UPDATE CASCADE
);
