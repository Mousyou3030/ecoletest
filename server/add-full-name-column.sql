-- Ajouter la colonne full_name à la table users
-- Cette colonne est générée automatiquement à partir de firstName et lastName

ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)
GENERATED ALWAYS AS (CONCAT(COALESCE(firstName, ''), ' ', COALESCE(lastName, ''))) STORED;

-- Vérification
SELECT id, firstName, lastName, full_name FROM users LIMIT 5;
