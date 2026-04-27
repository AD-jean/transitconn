-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'TRANSITAIRE'
                CHECK (role IN ('ADMIN', 'TRANSPORTEUR', 'TRANSITAIRE')),
  telephone   VARCHAR(20),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Table des frets
CREATE TABLE IF NOT EXISTS frets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  poids       DECIMAL(10,2) NOT NULL,
  origine     VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  statut      VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
                CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'LIVRE', 'ANNULE')),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Table des demandes de transport
CREATE TABLE IF NOT EXISTS demandes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fret_id          UUID NOT NULL REFERENCES frets(id) ON DELETE CASCADE,
  transporteur_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  statut           VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
                     CHECK (statut IN ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE')),
  message          TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  lu          BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Index pour accélérer les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_frets_user_id ON frets(user_id);
CREATE INDEX IF NOT EXISTS idx_frets_statut ON frets(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_fret_id ON demandes(fret_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);