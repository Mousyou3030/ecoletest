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
        COUNT(DISTINCT a.student_id) as studentCount,
        AVG(g.grade) as averageGrade,
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)) as attendanceRate
       FROM classes c
       LEFT JOIN courses co ON c.id = co.class_id
       LEFT JOIN attendances a ON c.id = a.class_id
       LEFT JOIN grades g ON g.course_id = co.id
       WHERE c.teacher_id = ? OR co.teacher_id = ?
       GROUP BY c.id, c.name, c.level`,
      [teacherId, teacherId]
    );

    const classesWithNextLesson = await Promise.all(
      classes[0].map(async (cls) => {
        const [nextLesson] = await pool.execute(
          `SELECT
            s.day_of_week as dayOfWeek,
            DATE_FORMAT(s.start_time, '%H:%i') as time,
            co.name as topic
           FROM schedules s
           JOIN courses co ON s.course_id = co.id
           WHERE s.class_id = ? AND s.teacher_id = ?
           ORDER BY s.day_of_week, s.start_time
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
    const { classId } = req.params;

    const students = await pool.execute(
      `SELECT DISTINCT
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.first_name as firstName,
        u.last_name as lastName,
        (SELECT g.grade
         FROM grades g
         JOIN courses co ON g.course_id = co.id
         WHERE g.student_id = u.id AND co.class_id = ?
         ORDER BY g.created_at DESC
         LIMIT 1) as lastGrade,
        (SELECT COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)
         FROM attendances a
         WHERE a.student_id = u.id AND a.class_id = ?
         AND a.date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)) as attendance
       FROM users u
       JOIN attendances a ON u.id = a.student_id
       WHERE a.class_id = ? AND u.role = 'student'
       GROUP BY u.id, u.first_name, u.last_name`,
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
        co.name as title,
        co.description,
        co.subject,
        co.teacher_id as teacherId,
        co.class_id as classId,
        co.created_at as createdAt,
        cl.name as className,
        (SELECT COUNT(*) FROM grades g WHERE g.course_id = co.id) as gradeCount,
        (SELECT COUNT(DISTINCT s.id) FROM schedules s WHERE s.course_id = co.id) as sessionCount
       FROM courses co
       LEFT JOIN classes cl ON co.class_id = cl.id
       WHERE co.teacher_id = ?
       ORDER BY co.created_at DESC`,
      [teacherId]
    );

    res.json(courses[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/schedules/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const schedules = await pool.execute(
      `SELECT
        s.id,
        s.day_of_week as dayOfWeek,
        DATE_FORMAT(s.start_time, '%H:%i') as startTime,
        DATE_FORMAT(s.end_time, '%H:%i') as endTime,
        s.room,
        co.name as courseName,
        co.subject,
        cl.name as className,
        cl.id as classId
       FROM schedules s
       JOIN courses co ON s.course_id = co.id
       JOIN classes cl ON s.class_id = cl.id
       WHERE s.teacher_id = ?
       ORDER BY s.day_of_week, s.start_time`,
      [teacherId]
    );

    const schedulesByDay = {};
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    schedules[0].forEach(schedule => {
      const dayName = daysOfWeek[schedule.dayOfWeek - 1];
      if (!schedulesByDay[dayName]) {
        schedulesByDay[dayName] = [];
      }
      schedulesByDay[dayName].push({
        id: schedule.id,
        time: `${schedule.startTime} - ${schedule.endTime}`,
        subject: schedule.courseName,
        class: schedule.className,
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
      SELECT
        g.id,
        g.grade,
        g.max_grade as maxGrade,
        g.exam_type as examType,
        g.comments,
        g.created_at as createdAt,
        CONCAT(u.first_name, ' ', u.last_name) as studentName,
        u.id as studentId,
        co.name as courseName,
        co.id as courseId,
        cl.name as className
       FROM grades g
       JOIN users u ON g.student_id = u.id
       JOIN courses co ON g.course_id = co.id
       LEFT JOIN classes cl ON co.class_id = cl.id
       WHERE co.teacher_id = ?
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

    query += ' ORDER BY g.created_at DESC';

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
        CONCAT(u.first_name, ' ', u.last_name) as studentName,
        u.id as studentId,
        cl.name as className,
        cl.id as classId
       FROM attendances a
       JOIN users u ON a.student_id = u.id
       JOIN classes cl ON a.class_id = cl.id
       WHERE cl.teacher_id = ?
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
