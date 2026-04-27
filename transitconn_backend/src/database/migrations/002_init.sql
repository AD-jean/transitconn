CREATE TABLE IF NOT EXISTS fichiers (
    id             UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
    fret_id        UUID  NOT NULL REFERENCES frets(id) ON DELETE CASCADE,
    user_id        UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom            VARCHAR(255) NOT NULL,
    chemin         VARCHAR(500) NOT NULL,
    taille         INTEGER NOT NULL,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fichiers_fret_id ON fichiers(fret_id)