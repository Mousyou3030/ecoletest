const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/classes/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await pool.execute(
      `SELECT DISTINCT
        c.id,
        c.name,
        c.level,
        COUNT(DISTINCT a.studentId) as studentCount,
        AVG(g.value) as averageGrade,
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)) as attendanceRate
       FROM classes c
       LEFT JOIN courses co ON c.id = co.classId
       LEFT JOIN attendances a ON c.id = a.classId
       LEFT JOIN grades g ON g.courseId = co.id
       WHERE c.teacherId = ? OR co.teacherId = ?
       GROUP BY c.id, c.name, c.level`,
      [teacherId, teacherId]
    );

    const classesWithNextLesson = await Promise.all(
      classes[0].map(async (cls) => {
        const [nextLesson] = await pool.execute(
          `SELECT
            s.day,
            DATE_FORMAT(s.startTime, '%H:%i') as time,
            s.subject as topic
           FROM schedules s
           WHERE s.classId = ? AND s.teacherId = ?
           ORDER BY
             FIELD(s.day, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'),
             s.startTime
           LIMIT 1`,
          [cls.id, teacherId]
        );

        return {
          ...cls,
          studentCount: cls.studentCount || 0,
          averageGrade: cls.averageGrade ? parseFloat(cls.averageGrade).toFixed(1) : '0.0',
          attendanceRate: cls.attendanceRate ? Math.round(cls.attendanceRate) : 0,
          nextLesson: nextLesson[0] || null
        };
      })
    );

    res.json(classesWithNextLesson);
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/classes/:teacherId/:classId/students', authenticateToken, async (req, res) => {
  try {
    const { teacherId, classId } = req.params;

    const [classCheck] = await pool.execute(
      `SELECT id FROM classes WHERE id = ? AND teacherId = ?`,
      [classId, teacherId]
    );

    if (classCheck.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé à cette classe' });
    }

    const students = await pool.execute(
      `SELECT DISTINCT
        u.id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        u.firstName,
        u.lastName,
        u.email,
        (SELECT g.value
         FROM grades g
         JOIN courses co ON g.courseId = co.id
         WHERE g.studentId = u.id AND co.classId = ?
         ORDER BY g.createdAt DESC
         LIMIT 1) as lastGrade,
        (SELECT COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)
         FROM attendances a
         WHERE a.studentId = u.id AND a.classId = ?
         AND a.date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)) as attendance
       FROM users u
       WHERE u.role = 'student'
       AND EXISTS (
         SELECT 1 FROM attendances a
         WHERE a.studentId = u.id AND a.classId = ?
       )
       ORDER BY u.lastName, u.firstName`,
      [classId, classId, classId]
    );

    const studentsWithBehavior = students[0].map(student => ({
      ...student,
      lastGrade: student.lastGrade || 0,
      attendance: student.attendance ? Math.round(student.attendance) : 0,
      behavior: student.lastGrade >= 15 ? 'excellent' : student.lastGrade >= 12 ? 'good' : 'average'
    }));

    res.json(studentsWithBehavior);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/courses/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const courses = await pool.execute(
      `SELECT
        co.id,
        co.title,
        co.description,
        co.subject,
        co.teacherId,
        co.classId,
        co.createdAt,
        cl.name as className,
        (SELECT COUNT(*) FROM grades g WHERE g.courseId = co.id) as gradeCount,
        (SELECT COUNT(DISTINCT s.id) FROM schedules s
         WHERE s.classId = co.classId
         AND s.teacherId = co.teacherId
         AND s.subject = co.subject) as sessionCount
       FROM courses co
       LEFT JOIN classes cl ON co.classId = cl.id
       WHERE co.teacherId = ?
       ORDER BY co.createdAt DESC`,
      [teacherId]
    );

    res.json(courses[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/courses/:courseId/students', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const [courseCheck] = await pool.execute(
      `SELECT teacherId FROM courses WHERE id = ?`,
      [courseId]
    );

    if (courseCheck.length === 0) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    if (req.user.role === 'teacher' && courseCheck[0].teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé à ce cours' });
    }

    const students = await pool.execute(
      `SELECT DISTINCT
        u.id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        u.firstName,
        u.lastName,
        u.email
       FROM users u
       JOIN attendances a ON u.id = a.studentId
       JOIN courses co ON a.classId = co.classId
       WHERE co.id = ? AND u.role = 'student'
       ORDER BY u.lastName, u.firstName`,
      [courseId]
    );

    res.json(students[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/schedules/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const schedules = await pool.execute(
      `SELECT
        s.id,
        s.day,
        DATE_FORMAT(s.startTime, '%H:%i') as startTime,
        DATE_FORMAT(s.endTime, '%H:%i') as endTime,
        s.room,
        s.subject as courseName,
        s.subject,
        cl.name as className,
        cl.id as classId
       FROM schedules s
       JOIN classes cl ON s.classId = cl.id
       WHERE s.teacherId = ?
       ORDER BY
         FIELD(s.day, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'),
         s.startTime`,
      [teacherId]
    );

    const schedulesByDay = {};

    schedules[0].forEach(schedule => {
      const dayName = schedule.day;
      if (!schedulesByDay[dayName]) {
        schedulesByDay[dayName] = [];
      }
      schedulesByDay[dayName].push({
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        subject: schedule.courseName,
        className: schedule.className,
        room: schedule.room,
        classId: schedule.classId
      });
    });

    res.json(schedulesByDay);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/grades/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { courseId, classId } = req.query;

    let query = `
      SELECT DISTINCT
        g.id,
        g.value as grade,
        g.maxValue as maxGrade,
        g.type as examType,
        g.comments,
        g.createdAt,
        g.date,
        CONCAT(u.firstName, ' ', u.lastName) as studentName,
        u.id as studentId,
        co.title as courseName,
        co.id as courseId,
        cl.name as className
       FROM grades g
       JOIN users u ON g.studentId = u.id
       JOIN courses co ON g.courseId = co.id
       LEFT JOIN classes cl ON co.classId = cl.id
       WHERE co.teacherId = ?
       AND u.role = 'student'
    `;
    const params = [teacherId];

    if (courseId) {
      query += ' AND co.id = ?';
      params.push(courseId);
    }

    if (classId) {
      query += ' AND cl.id = ?';
      params.push(classId);
    }

    query += ' ORDER BY g.createdAt DESC';

    const grades = await pool.execute(query, params);
    res.json(grades[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/attendances/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { classId, date } = req.query;

    let query = `
      SELECT
        a.id,
        a.date,
        a.status,
        a.notes,
        CONCAT(u.firstName, ' ', u.lastName) as studentName,
        u.id as studentId,
        cl.name as className,
        cl.id as classId
       FROM attendances a
       JOIN users u ON a.studentId = u.id
       JOIN classes cl ON a.classId = cl.id
       WHERE cl.teacherId = ?
       AND u.role = 'student'
    `;
    const params = [teacherId];

    if (classId) {
      query += ' AND cl.id = ?';
      params.push(classId);
    }

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    } else {
      query += ' AND a.date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
    }

    query += ' ORDER BY a.date DESC, studentName';

    const attendances = await pool.execute(query, params);
    res.json(attendances[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des présences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
