-- ============================================================
-- 003_playoffs.sql — Fase de playoffs en partidos
-- ============================================================
-- Agrega:
--   - matches.phase : fase del partido ('regular' | 'cuartos' | 'semis' | 'final')
-- Los partidos existentes quedan como 'regular' (default), así que
-- no cambia ningún comportamiento actual.
-- Idempotente: se puede correr más de una vez sin error.
-- ============================================================

ALTER TABLE matches ADD COLUMN IF NOT EXISTS phase VARCHAR(20) NOT NULL DEFAULT 'regular';
