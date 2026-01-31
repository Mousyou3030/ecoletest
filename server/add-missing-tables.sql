-- Ajout des tables manquantes pour messages, paramètres et logs système

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_created_at (created_at)
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_key (category, setting_key),
    INDEX idx_category (category)
);

-- Table des logs système
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    message TEXT NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_level (level),
    INDEX idx_created_at (created_at),
    INDEX idx_user (user_id)
);

-- Ajout de last_login à la table users si elle n'existe pas
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;

-- Ajout de full_name à la table users pour simplifier les requêtes
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(firstName, ' ', lastName)) STORED;

-- Ajout de class_id à la table users pour simplifier les relations
ALTER TABLE users ADD COLUMN IF NOT EXISTS class_id INT NULL;
ALTER TABLE users ADD CONSTRAINT fk_user_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- Insertion de paramètres par défaut
INSERT INTO settings (category, setting_key, setting_value) VALUES
('general', 'schoolName', 'École Primaire Saint-Martin'),
('general', 'address', '123 Rue de l''École, 75001 Paris'),
('general', 'phone', '+33 1 23 45 67 89'),
('general', 'email', 'contact@ecole-saint-martin.fr'),
('general', 'website', 'www.ecole-saint-martin.fr'),
('general', 'academicYear', '2023-2024'),
('general', 'timezone', 'Europe/Paris'),
('general', 'language', 'fr'),
('notifications', 'emailNotifications', 'true'),
('notifications', 'smsNotifications', 'false'),
('notifications', 'pushNotifications', 'true'),
('notifications', 'parentNotifications', 'true'),
('notifications', 'teacherNotifications', 'true'),
('notifications', 'adminNotifications', 'true'),
('notifications', 'gradeNotifications', 'true'),
('notifications', 'attendanceNotifications', 'true'),
('notifications', 'paymentNotifications', 'true'),
('security', 'twoFactorAuth', 'false'),
('security', 'passwordExpiry', '90'),
('security', 'sessionTimeout', '30'),
('security', 'loginAttempts', '5'),
('security', 'dataEncryption', 'true'),
('security', 'auditLog', 'true'),
('security', 'backupFrequency', 'daily'),
('academic', 'gradingScale', '20'),
('academic', 'passingGrade', '10'),
('academic', 'attendanceRequired', '80'),
('academic', 'maxAbsences', '10'),
('academic', 'termDuration', 'trimester')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Exemple de données de messages (optionnel)
-- INSERT INTO messages (sender_id, recipient_id, subject, content, is_read) VALUES
-- (1, 2, 'Test Message', 'Ceci est un message de test', FALSE);
