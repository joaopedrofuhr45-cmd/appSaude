CREATE TABLE medico (
                        idMedico BIGINT AUTO_INCREMENT PRIMARY KEY,
                        cpfMedico VARCHAR(11) NOT NULL,
                        nomeMedico VARCHAR(155) NOT NULL,
                        especialidadeMedico VARCHAR(100),
                        crmMedico VARCHAR(20) NOT NULL,
                        senhaMedico VARCHAR(255) NOT NULL
);