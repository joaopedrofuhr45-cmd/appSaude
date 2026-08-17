CREATE TABLE paciente (
                          idPaciente BIGINT AUTO_INCREMENT PRIMARY KEY,
                          nomePaciente VARCHAR(150) NOT NULL,
                          emailPaciente VARCHAR(150),
                          senhaPaciente VARCHAR(255) NOT NULL,
                          telefonePaciente VARCHAR(20),
                          cpfPaciente VARCHAR(11) NOT NULL,
                          data_nascimentoPaciente DATE,
                          criado_emPaciente TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);