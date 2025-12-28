-- Structure complète pour le système de gestion scolaire
-- Exécutez ce script dans votre base MySQL

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    role ENUM('admin', 'teacher', 'student', 'parent') DEFAULT 'student',
    phone VARCHAR(20),
    address TEXT,
    dateOfBirth DATE,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
);

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50),
    academicYear VARCHAR(20),
    teacherId INT,
    capacity INT DEFAULT 30,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacherId)
);

-- Table des étudiants dans les classes
CREATE TABLE IF NOT EXISTS class_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classId INT NOT NULL,
    studentId INT NOT NULL,
    enrollmentDate DATE DEFAULT (CURRENT_DATE),
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_student (classId, studentId),
    INDEX idx_class (classId),
    INDEX idx_student (studentId)
);

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    teacherId INT,
    classId INT,
    subject VARCHAR(100),
    startDate DATE,
    endDate DATE,
    materials JSON,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacherId),
    INDEX idx_class (classId)
);

-- Table des emplois du temps
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    day ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacherId VARCHAR(36),
    classId VARCHAR(36) NOT NULL,
    room VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_day_time (day, startTime),
    INDEX idx_teacher (teacherId),
    INDEX idx_class (classId)
);

-- Table des présences
CREATE TABLE IF NOT EXISTS attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    classId INT,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    notes TEXT,
    markedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (markedBy) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (studentId, date, classId),
    INDEX idx_date (date),
    INDEX idx_student (studentId),
    INDEX idx_class (classId),
    INDEX idx_status (status)
);

-- Table des notes
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    courseId INT NOT NULL,
    grade DECIMAL(5,2) NOT NULL,
    maxGrade DECIMAL(5,2) DEFAULT 20.00,
    examType VARCHAR(50),
    comments TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student (studentId),
    INDEX idx_course (courseId),
    INDEX idx_date (createdAt)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paymentType VARCHAR(50),
    description TEXT,
    dueDate DATE,
    paidDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (studentId),
    INDEX idx_status (status),
    INDEX idx_date (dueDate)
);

-- Table de liaison parent-enfant
CREATE TABLE IF NOT EXISTS parent_children (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parentId INT NOT NULL,
    childId INT NOT NULL,
    relationship VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (childId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_child (parentId, childId),
    INDEX idx_parent (parentId),
    INDEX idx_child (childId)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sender (senderId),
    INDEX idx_receiver (receiverId),
    INDEX idx_date (createdAt)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_date (createdAt)
);

-- Données de test (optionnel)
-- Mot de passe pour tous: password123
INSERT IGNORE INTO users (id, email, password, firstName, lastName, role) VALUES
(1, 'admin@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Admin', 'School', 'admin'),
(2, 'teacher@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Jean', 'Dupont', 'teacher'),
(3, 'student@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Marie', 'Martin', 'student'),
(4, 'parent@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Pierre', 'Martin', 'parent');

-- Créer une classe de test
INSERT IGNORE INTO classes (id, name, level, academicYear, teacherId) VALUES
(1, 'CM1-A', 'CM1', '2024-2025', 2);

-- Lier l'étudiant à la classe
INSERT IGNORE INTO class_students (classId, studentId, isActive) VALUES
(1, 3, TRUE);

-- Créer un cours
INSERT IGNORE INTO courses (id, title, teacherId, classId, subject) VALUES
(1, 'Mathématiques CM1', 2, 1, 'Mathématiques');

-- Créer un emploi du temps (Lundi 09:00-10:00)
-- Note: l'ID sera généré automatiquement par UUID()
-- INSERT IGNORE INTO schedules (subject, classId, teacherId, day, startTime, endTime, room) VALUES
-- ('Mathématiques', 1, 2, 'Lundi', '09:00:00', '10:00:00', 'Salle 101');

-- Lier parent à enfant
INSERT IGNORE INTO parent_children (parentId, childId, relationship) VALUES
(4, 3, 'Père');

-- Ajouter quelques notes de test
INSERT IGNORE INTO grades (studentId, courseId, grade, maxGrade, examType) VALUES
(3, 1, 16.50, 20.00, 'Contrôle'),
(3, 1, 14.00, 20.00, 'Devoir'),
(3, 1, 18.00, 20.00, 'Examen');

-- Ajouter des présences de test
INSERT IGNORE INTO attendances (studentId, classId, date, status) VALUES
(3, 1, CURRENT_DATE, 'present'),
(3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'present'),
(3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'late'),
(3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 'present');
