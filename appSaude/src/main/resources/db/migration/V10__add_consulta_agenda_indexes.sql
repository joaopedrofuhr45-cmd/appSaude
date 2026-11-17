CREATE INDEX idx_consulta_paciente_data_hora
    ON consulta(paciente_id, data_consulta DESC, hora_consulta DESC);

CREATE INDEX idx_consulta_medico_data_hora
    ON consulta(medico_id, data_consulta, hora_consulta);

CREATE INDEX idx_consulta_data_status
    ON consulta(data_consulta, status_consulta);
