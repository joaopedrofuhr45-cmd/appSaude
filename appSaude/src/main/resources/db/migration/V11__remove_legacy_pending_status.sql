ALTER TABLE consulta
    DROP CONSTRAINT IF EXISTS consulta_status_consulta_check;

UPDATE consulta
SET status_consulta = 'CONFIRMADA'
WHERE status_consulta = 'AGENDADA';

ALTER TABLE consulta
    ALTER COLUMN status_consulta SET DEFAULT 'CONFIRMADA';

ALTER TABLE consulta
    ADD CONSTRAINT consulta_status_consulta_check
    CHECK (status_consulta IN ('CONFIRMADA', 'REALIZADA', 'CANCELADA'));