-- Correction des types de colonnes dans la table schedules
-- Les colonnes teacherId et classId doivent être INT pour correspondre aux tables users et classes

-- Désactiver les contraintes de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les contraintes de clés étrangères existantes si elles existent
ALTER TABLE schedules
  DROP FOREIGN KEY IF EXISTS schedules_ibfk_1,
  DROP FOREIGN KEY IF EXISTS schedules_ibfk_2;

-- Modifier les types de colonnes
ALTER TABLE schedules
  MODIFY COLUMN id INT AUTO_INCREMENT,
  MODIFY COLUMN teacherId INT,
  MODIFY COLUMN classId INT NOT NULL;

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Ajouter les contraintes de clés étrangères avec les bons types
ALTER TABLE schedules
  ADD CONSTRAINT fk_schedules_teacher
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_schedules_class
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE;

-- Vérifier la structure
DESCRIBE schedules;
