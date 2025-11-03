-- Script de création des tables pour MySchool

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
    avatar VARCHAR(500),
    phone VARCHAR(20),
    address TEXT,
    dateOfBirth DATE,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    teacherId VARCHAR(36),
    capacity INT DEFAULT 30,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL
);

-- Table de liaison élèves-classes
CREATE TABLE IF NOT EXISTS student_classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) NOT NULL,
    classId VARCHAR(36) NOT NULL,
    enrollmentDate DATE DEFAULT (CURRENT_DATE),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_class (studentId, classId)
);

-- Table de liaison parents-enfants
CREATE TABLE IF NOT EXISTS parent_children (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    parentId VARCHAR(36) NOT NULL,
    childId VARCHAR(36) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (childId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_child (parentId, childId)
);

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    teacherId VARCHAR(36) NOT NULL,
    classId VARCHAR(36) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    materials JSON,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
);

-- Table des emplois du temps
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    day ENUM('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacherId VARCHAR(36) NOT NULL,
    classId VARCHAR(36) NOT NULL,
    room VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
);

-- Table des notes
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) NOT NULL,
    courseId VARCHAR(36) NOT NULL,
    teacherId VARCHAR(36) NOT NULL,
    `value` DECIMAL(4,2) NOT NULL,
    maxValue DECIMAL(4,2) NOT NULL DEFAULT 20.00,
    type ENUM('exam', 'homework', 'participation', 'project') NOT NULL,
    date DATE NOT NULL,
    comments TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des présences
CREATE TABLE IF NOT EXISTS attendances (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) NOT NULL,
    courseId VARCHAR(36),
    classId VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    notes TEXT,
    markedBy VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (markedBy) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_date (studentId, date, courseId)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    senderId VARCHAR(36) NOT NULL,
    receiverId VARCHAR(36),
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('individual', 'class', 'parents', 'broadcast') DEFAULT 'individual',
    classId VARCHAR(36),
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    studentId VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('tuition', 'canteen', 'transport', 'materials', 'other') NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    dueDate DATE NOT NULL,
    paidDate DATE,
    method ENUM('cash', 'card', 'transfer', 'check'),
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertion des données de test
INSERT INTO users (id, email, password, firstName, lastName, role) VALUES
('admin-1', 'admin@school.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Dubois', 'admin'),
('teacher-1', 'teacher@school.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Martin', 'teacher'),
('student-1', 'student@school.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie', 'Dupont', 'student'),
('parent-1', 'parent@school.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pierre', 'Dupont', 'parent');

INSERT INTO classes (id, name, level, teacherId) VALUES
('class-1', '6ème A', '6ème', 'teacher-1'),
('class-2', '6ème B', '6ème', 'teacher-1'),
('class-3', '3ème A', '3ème', 'teacher-1');

INSERT INTO student_classes (studentId, classId) VALUES
('student-1', 'class-1');

INSERT INTO parent_children (parentId, childId) VALUES
('parent-1', 'student-1');