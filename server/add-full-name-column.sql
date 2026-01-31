-- Ajouter la colonne full_name à la table users
-- Cette colonne est générée automatiquement à partir de firstName et lastName

-- Vérifier si la colonne existe avant de l'ajouter
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'full_name';

-- Ajouter la colonne seulement si elle n'existe pas
SET @query = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(COALESCE(firstName, \'\'), \' \', COALESCE(lastName, \'\'))) STORED',
  'SELECT "La colonne full_name existe déjà" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérification
SELECT id, firstName, lastName, full_name FROM users LIMIT 5;
