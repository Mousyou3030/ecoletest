const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/admin-stats', authenticateToken, async (req, res) => {
  try {
    const studentCount = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "student"'
    );

    const teacherCount = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "teacher"'
    );

    const classCount = await pool.execute(
      'SELECT COUNT(*) as count FROM classes'
    );

    const recentGrades = await pool.execute(
      `SELECT CONCAT(u.firstName, ' ', u.lastName) as user, g.createdAt
       FROM grades g
       JOIN users u ON g.studentId = u.id
       ORDER BY g.createdAt DESC
       LIMIT 2`
    );

    const recentPayments = await pool.execute(
      `SELECT CONCAT(u.firstName, ' ', u.lastName) as user, p.paidDate as createdAt
       FROM payments p
       JOIN users u ON p.studentId = u.id
       WHERE p.status = 'paid'
       ORDER BY p.paidDate DESC
       LIMIT 2`
    );

    const recentAbsences = await pool.execute(
      `SELECT CONCAT(u.firstName, ' ', u.lastName) as user, a.createdAt
       FROM attendances a
       JOIN users u ON a.studentId = u.id
       WHERE a.status = 'absent'
       ORDER BY a.createdAt DESC
       LIMIT 1`
    );

    const recentActivity = [];
    recentGrades[0].forEach(item => recentActivity.push({ action: 'Note ajoutée', user: item.user, createdAt: item.createdAt, type: 'info' }));
    recentPayments[0].forEach(item => recentActivity.push({ action: 'Paiement reçu', user: item.user, createdAt: item.createdAt, type: 'success' }));
    recentAbsences[0].forEach(item => recentActivity.push({ action: 'Absence signalée', user: item.user, createdAt: item.createdAt, type: 'warning' }));
    recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      totalStudents: studentCount[0][0]?.count || 0,
      totalTeachers: teacherCount[0][0]?.count || 0,
      totalClasses: classCount[0][0]?.count || 0,
      monthlyRevenue: 45230,
      performanceMetrics: {
        successRate: 92.5,
        attendanceRate: 88.3,
        parentSatisfaction: 94.1
      },
      recentActivity: recentActivity.slice(0, 5)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await pool.execute(
      'SELECT firstName, lastName FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );

    if (student[0].length === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    const nextClasses = await pool.execute(
      `SELECT
        s.startTime,
        s.subject,
        CONCAT(u.firstName, ' ', u.lastName) as teacher,
        s.room
       FROM schedules s
       JOIN users u ON s.teacherId = u.id
       JOIN classes cl ON s.classId = cl.id
       WHERE s.day = CASE DAYOFWEEK(CURRENT_DATE)
         WHEN 1 THEN 'Dimanche'
         WHEN 2 THEN 'Lundi'
         WHEN 3 THEN 'Mardi'
         WHEN 4 THEN 'Mercredi'
         WHEN 5 THEN 'Jeudi'
         WHEN 6 THEN 'Vendredi'
         WHEN 7 THEN 'Samedi'
       END
       AND s.startTime > CURRENT_TIME
       AND s.classId IN (SELECT classId FROM class_students WHERE studentId = ?)
       ORDER BY s.startTime
       LIMIT 3`,
      [studentId]
    );

    const recentGrades = await pool.execute(
      `SELECT
        co.title as subject,
        g.value as grade,
        g.maxValue as max,
        g.createdAt as date
       FROM grades g
       JOIN courses co ON g.courseId = co.id
       WHERE g.studentId = ?
       ORDER BY g.createdAt DESC
       LIMIT 4`,
      [studentId]
    );

    const assignments = [];

    const averageGrade = recentGrades[0].length > 0
      ? (recentGrades[0].reduce((acc, g) => acc + parseFloat(g.grade), 0) / recentGrades[0].length).toFixed(1)
      : 0;

    const attendanceStats = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendances
       WHERE studentId = ?
       AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)`,
      [studentId]
    );

    const attendance = attendanceStats[0][0]?.total > 0
      ? Math.round((attendanceStats[0][0].present / attendanceStats[0][0].total) * 100)
      : 96;

    res.json({
      student: student[0][0],
      averageGrade: parseFloat(averageGrade),
      attendance,
      completedAssignments: 12,
      classRank: 3,
      nextClasses: nextClasses[0] || [],
      recentGrades: recentGrades[0] || [],
      assignments: assignments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await pool.execute(
      'SELECT firstName, lastName FROM users WHERE id = ? AND role = "teacher"',
      [teacherId]
    );

    if (teacher[0].length === 0) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }

    const myClasses = await pool.execute(
      `SELECT COUNT(DISTINCT classId) as count
       FROM courses
       WHERE teacherId = ?`,
      [teacherId]
    );

    const coursesThisWeek = await pool.execute(
      `SELECT COUNT(*) as count FROM schedules
       WHERE teacherId = ?
       AND WEEK(NOW()) = WEEK(CURRENT_DATE)`,
      [teacherId]
    );

    const totalStudents = await pool.execute(
      `SELECT COUNT(DISTINCT a.studentId) as count
       FROM attendances a
       JOIN classes cl ON a.classId = cl.id
       WHERE cl.teacherId = ?`,
      [teacherId]
    );

    const todaySchedule = await pool.execute(
      `SELECT
        DATE_FORMAT(s.startTime, '%H:%i') as time,
        s.subject,
        cl.name as class,
        s.room
       FROM schedules s
       JOIN classes cl ON s.classId = cl.id
       WHERE s.teacherId = ?
       AND s.day = CASE DAYOFWEEK(CURRENT_DATE)
         WHEN 1 THEN 'Dimanche'
         WHEN 2 THEN 'Lundi'
         WHEN 3 THEN 'Mardi'
         WHEN 4 THEN 'Mercredi'
         WHEN 5 THEN 'Jeudi'
         WHEN 6 THEN 'Vendredi'
         WHEN 7 THEN 'Samedi'
       END
       ORDER BY s.startTime`,
      [teacherId]
    );

    const attendanceRate = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendances a
       JOIN classes cl ON a.classId = cl.id
       WHERE cl.teacherId = ?
       AND a.date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)`,
      [teacherId]
    );

    const rate = attendanceRate[0][0]?.total > 0
      ? Math.round((attendanceRate[0][0].present / attendanceRate[0][0].total) * 100)
      : 92;

    const upcomingTasks = [
      { task: 'Correction des copies de Mathématiques', deadline: 'Demain', priority: 'high' },
      { task: 'Préparation du cours de Physique', deadline: 'Dans 2 jours', priority: 'medium' },
      { task: 'Réunion parents-professeurs', deadline: 'Vendredi', priority: 'medium' }
    ];

    res.json({
      teacher: teacher[0][0],
      myClasses: myClasses[0][0]?.count || 0,
      coursesThisWeek: coursesThisWeek[0][0]?.count || 0,
      totalStudents: totalStudents[0][0]?.count || 0,
      attendanceRate: rate,
      todaySchedule: todaySchedule[0] || [],
      upcomingTasks: upcomingTasks
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard enseignant:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/parent/:parentId', authenticateToken, async (req, res) => {
  try {
    const { parentId } = req.params;

    const children = await pool.execute(
      `SELECT u.id, u.firstName, u.lastName, c.name as className, c.id as classId
       FROM users u
       JOIN parent_children pc ON u.id = pc.childId
       LEFT JOIN attendances a ON u.id = a.studentId
       LEFT JOIN classes c ON a.classId = c.id
       WHERE pc.parentId = ?
       GROUP BY u.id, u.firstName, u.lastName, c.name, c.id
       LIMIT 10`,
      [parentId]
    );

    const childrenWithData = await Promise.all(
      children[0].map(async (child) => {
        const recentGrades = await pool.execute(
          `SELECT co.title as subject, g.value as grade, g.maxValue as max, g.date
           FROM grades g
           JOIN courses co ON g.courseId = co.id
           WHERE g.studentId = ?
           ORDER BY g.createdAt DESC
           LIMIT 5`,
          [child.id]
        );

        const avgGrade = recentGrades[0].length > 0
          ? recentGrades[0].reduce((acc, g) => acc + (g.grade / g.max) * 20, 0) / recentGrades[0].length
          : 0;

        const attendanceStats = await pool.execute(
          `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
           FROM attendances
           WHERE studentId = ?
           AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)`,
          [child.id]
        );

        const attendance = attendanceStats[0][0].total > 0
          ? Math.round((attendanceStats[0][0].present / attendanceStats[0][0].total) * 100)
          : 0;

        const nextClass = await pool.execute(
          `SELECT s.subject, DATE_FORMAT(s.startTime, '%H:%i') as time, s.room
           FROM schedules s
           JOIN classes c ON s.classId = c.id
           JOIN attendances a ON a.classId = c.id
           WHERE a.studentId = ?
           AND s.day = CASE DAYOFWEEK(CURRENT_DATE)
             WHEN 1 THEN 'Dimanche'
             WHEN 2 THEN 'Lundi'
             WHEN 3 THEN 'Mardi'
             WHEN 4 THEN 'Mercredi'
             WHEN 5 THEN 'Jeudi'
             WHEN 6 THEN 'Vendredi'
             WHEN 7 THEN 'Samedi'
           END
           ORDER BY s.startTime
           LIMIT 1`,
          [child.id]
        );

        return {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          className: child.className || 'Non assigné',
          average: Math.round(avgGrade * 10) / 10,
          attendance: attendance,
          nextClass: nextClass[0][0] || null,
          recentGrades: recentGrades[0] || []
        };
      })
    );

    const unpaidInvoices = await pool.execute(
      `SELECT COUNT(*) as count
       FROM payments p
       JOIN parent_children pc ON p.studentId = pc.childId
       WHERE pc.parentId = ? AND p.status = 'pending'`,
      [parentId]
    );

    const upcomingEvents = await pool.execute(
      `SELECT DISTINCT
        DATE_FORMAT(s.startTime, '%d/%m') as date,
        s.subject as event,
        u.firstName as childName
       FROM schedules s
       JOIN classes c ON s.classId = c.id
       JOIN attendances a ON a.classId = c.id
       JOIN users u ON a.studentId = u.id
       JOIN parent_children pc ON u.id = pc.childId
       WHERE pc.parentId = ?
       AND s.day IN (
         CASE DAYOFWEEK(DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY))
           WHEN 1 THEN 'Dimanche' WHEN 2 THEN 'Lundi' WHEN 3 THEN 'Mardi'
           WHEN 4 THEN 'Mercredi' WHEN 5 THEN 'Jeudi' WHEN 6 THEN 'Vendredi'
           WHEN 7 THEN 'Samedi' END,
         CASE DAYOFWEEK(DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY))
           WHEN 1 THEN 'Dimanche' WHEN 2 THEN 'Lundi' WHEN 3 THEN 'Mardi'
           WHEN 4 THEN 'Mercredi' WHEN 5 THEN 'Jeudi' WHEN 6 THEN 'Vendredi'
           WHEN 7 THEN 'Samedi' END
       )
       ORDER BY s.startTime
       LIMIT 5`,
      [parentId]
    );

    res.json({
      children: childrenWithData,
      unpaidInvoices: unpaidInvoices[0][0]?.count || 0,
      upcomingEvents: upcomingEvents[0] || []
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard parent:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
