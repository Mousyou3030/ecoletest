const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/admin-stats', authenticateToken, async (req, res) => {
  try {
    const studentCount = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "student" AND isActive = TRUE'
    );

    const teacherCount = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "teacher" AND isActive = TRUE'
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
        c.name as subject,
        CONCAT(u.firstName, ' ', u.lastName) as teacher,
        s.room
       FROM schedules s
       JOIN courses c ON s.classId = c.classId
       JOIN users u ON c.teacherId = u.id
       WHERE s.classId IN (
         SELECT classId FROM student_classes WHERE studentId = ?
       )
       AND s.day = DAYNAME(CURRENT_DATE)
       AND s.startTime > CURRENT_TIME
       ORDER BY s.startTime
       LIMIT 3`,
      [studentId]
    );

    const recentGrades = await pool.execute(
      `SELECT
        c.subject as subject,
        g.value as grade,
        g.maxValue as max,
        g.createdAt as date
       FROM grades g
       JOIN courses c ON g.courseId = c.id
       WHERE g.studentId = ?
       ORDER BY g.createdAt DESC
       LIMIT 4`,
      [studentId]
    );

    const assignments = await pool.execute(
      `SELECT
        c.name as subject,
        a.title,
        a.dueDate as due,
        IF(a.dueDate <= DATE_ADD(NOW(), INTERVAL 1 DAY), true, false) as urgent
       FROM grades g
       JOIN courses c ON g.courseId = c.id
       WHERE g.studentId = ?
       AND g.date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
       ORDER BY g.date DESC
       LIMIT 3`,
      [studentId]
    );

    const averageGrade = recentGrades[0].length > 0
      ? (recentGrades[0].reduce((acc, g) => acc + parseFloat(g.grade), 0) / recentGrades[0].length).toFixed(1)
      : 0;

    res.json({
      student: student[0][0],
      averageGrade,
      attendance: 96,
      completedAssignments: 12,
      classRank: 3,
      nextClasses: nextClasses[0] || [],
      recentGrades: recentGrades[0] || [],
      assignments: assignments[0] || []
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
      `SELECT COUNT(*) as count FROM courses WHERE teacherId = ?`,
      [teacherId]
    );

    const coursesThisWeek = await pool.execute(
      `SELECT COUNT(*) as count FROM schedules
       WHERE teacherId = ?
       AND isActive = TRUE`,
      [teacherId]
    );

    const totalStudents = await pool.execute(
      `SELECT COUNT(DISTINCT sc.studentId) as count
       FROM student_classes sc
       WHERE sc.classId IN (
         SELECT DISTINCT classId FROM courses WHERE teacherId = ?
       )`,
      [teacherId]
    );

    const todaySchedule = await pool.execute(
      `SELECT
        s.startTime as time,
        s.subject,
        cl.name as class,
        s.room
       FROM schedules s
       JOIN classes cl ON s.classId = cl.id
       WHERE s.teacherId = ?
       AND s.day = DAYNAME(CURRENT_DATE)
       ORDER BY s.startTime`,
      [teacherId]
    );

    const upcomingTasks = [];

    res.json({
      teacher: teacher[0][0],
      myClasses: myClasses[0][0]?.count || 0,
      coursesThisWeek: coursesThisWeek[0][0]?.count || 0,
      totalStudents: totalStudents[0][0]?.count || 0,
      attendanceRate: 92,
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
      `SELECT u.id, u.firstName, u.lastName, c.name as className
       FROM users u
       JOIN parent_children pc ON u.id = pc.childId
       JOIN student_classes sc ON u.id = sc.studentId
       JOIN classes c ON sc.classId = c.id
       WHERE pc.parentId = ? AND u.isActive = TRUE`,
      [parentId]
    );

    res.json({
      children: children[0] || [],
      unpaidInvoices: 0,
      upcomingEvents: []
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard parent:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
