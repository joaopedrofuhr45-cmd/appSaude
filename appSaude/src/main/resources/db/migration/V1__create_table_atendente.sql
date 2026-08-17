CREATE TABLE atendente (
                           idAtendente BIGINT AUTO_INCREMENT PRIMARY KEY,
                           cpfAtendente VARCHAR(11) NOT NULL,
                           senhaAtendente VARCHAR(255) NOT NULL,
                           nomeAtendente VARCHAR(150) NOT NULL
);