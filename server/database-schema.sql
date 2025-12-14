-- Structure complète pour le système de gestion scolaire
-- Exécutez ce script dans votre base MySQL

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'teacher', 'student', 'parent') DEFAULT 'student',
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
);

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50),
    academic_year VARCHAR(20),
    teacher_id INT,
    capacity INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacher_id)
);

-- Table des étudiants dans les classes
CREATE TABLE IF NOT EXISTS class_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_student (class_id, student_id),
    INDEX idx_class (class_id),
    INDEX idx_student (student_id)
);

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    teacher_id INT,
    class_id INT,
    subject VARCHAR(100),
    credits INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_class (class_id)
);

-- Table des emplois du temps
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    class_id INT NOT NULL,
    teacher_id INT,
    day_of_week INT NOT NULL COMMENT '1=Dimanche, 2=Lundi, ..., 7=Samedi',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_day_time (day_of_week, start_time),
    INDEX idx_course (course_id),
    INDEX idx_teacher (teacher_id)
);

-- Table des présences
CREATE TABLE IF NOT EXISTS attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    notes TEXT,
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, date, class_id),
    INDEX idx_date (date),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_status (status)
);

-- Table des notes
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade DECIMAL(5,2) NOT NULL,
    max_grade DECIMAL(5,2) DEFAULT 20.00,
    exam_type VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_course (course_id),
    INDEX idx_date (created_at)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_type VARCHAR(50),
    description TEXT,
    due_date DATE,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_date (due_date)
);

-- Table de liaison parent-enfant
CREATE TABLE IF NOT EXISTS parent_children (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    child_id INT NOT NULL,
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_child (parent_id, child_id),
    INDEX idx_parent (parent_id),
    INDEX idx_child (child_id)
);

-- Données de test (optionnel)
-- Mot de passe pour tous: password123
INSERT IGNORE INTO users (id, email, password, first_name, last_name, role) VALUES
(1, 'admin@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Admin', 'School', 'admin'),
(2, 'teacher@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Jean', 'Dupont', 'teacher'),
(3, 'student@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Marie', 'Martin', 'student'),
(4, 'parent@school.com', '$2a$10$XQP5qLpzV0H/Q.8Tq8xLVO7g2L9lXR6bZiKX.K7Z3X8YxZ5L6Y9jK', 'Pierre', 'Martin', 'parent');

-- Créer une classe de test
INSERT IGNORE INTO classes (id, name, level, academic_year, teacher_id) VALUES
(1, 'CM1-A', 'CM1', '2024-2025', 2);

-- Lier l'étudiant à la classe
INSERT IGNORE INTO class_students (class_id, student_id, is_active) VALUES
(1, 3, TRUE);

-- Créer un cours
INSERT IGNORE INTO courses (id, name, teacher_id, class_id, subject) VALUES
(1, 'Mathématiques CM1', 2, 1, 'Mathématiques');

-- Créer un emploi du temps (Lundi 09:00-10:00)
INSERT IGNORE INTO schedules (course_id, class_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
(1, 1, 2, 2, '09:00:00', '10:00:00', 'Salle 101');

-- Lier parent à enfant
INSERT IGNORE INTO parent_children (parent_id, child_id, relationship) VALUES
(4, 3, 'Père');

-- Ajouter quelques notes de test
INSERT IGNORE INTO grades (student_id, course_id, grade, max_grade, exam_type) VALUES
(3, 1, 16.50, 20.00, 'Contrôle'),
(3, 1, 14.00, 20.00, 'Devoir'),
(3, 1, 18.00, 20.00, 'Examen');

-- Ajouter des présences de test
INSERT IGNORE INTO attendances (student_id, class_id, date, status) VALUES
(3, 1, CURRENT_DATE, 'present'),
(3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'present'),
(3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'late'),
(3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 'present');
