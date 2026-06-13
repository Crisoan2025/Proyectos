-- ============================================================
-- 002_images.sql — Soporte de imágenes (Fase 1: URLs)
-- ============================================================
-- Agrega:
--   - players.photo_url : foto del jugador (URL, opcional)
--   - teams.logo_url    : logo del equipo (URL, opcional)
--   - settings          : config global de la liga (singleton, 1 fila)
-- Todo aditivo y nullable: no rompe datos existentes.
-- Idempotente: se puede correr más de una vez sin error.
-- ============================================================

ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE teams   ADD COLUMN IF NOT EXISTS logo_url  TEXT;

CREATE TABLE IF NOT EXISTS settings (
    id              integer PRIMARY KEY DEFAULT 1,
    league_name     varchar(100) DEFAULT 'Liga TPO',
    league_logo_url TEXT,
    CONSTRAINT settings_singleton CHECK (id = 1)   -- garantiza una sola fila
);

-- Fila única de configuración (si no existe)
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
