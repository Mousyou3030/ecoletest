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
      `SELECT CONCAT(u.first_name, ' ', u.last_name) as user, g.created_at as createdAt
       FROM grades g
       JOIN users u ON g.student_id = u.id
       ORDER BY g.created_at DESC
       LIMIT 2`
    );

    const recentPayments = await pool.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) as user, p.paid_date as createdAt
       FROM payments p
       JOIN users u ON p.student_id = u.id
       WHERE p.status = 'paid'
       ORDER BY p.paid_date DESC
       LIMIT 2`
    );

    const recentAbsences = await pool.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) as user, a.created_at as createdAt
       FROM attendances a
       JOIN users u ON a.student_id = u.id
       WHERE a.status = 'absent'
       ORDER BY a.created_at DESC
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
      'SELECT first_name as firstName, last_name as lastName FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );

    if (student[0].length === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    const nextClasses = await pool.execute(
      `SELECT
        s.start_time as startTime,
        co.name as subject,
        CONCAT(u.first_name, ' ', u.last_name) as teacher,
        s.room
       FROM schedules s
       JOIN courses co ON s.course_id = co.id
       JOIN users u ON co.teacher_id = u.id
       JOIN student_classes cs ON s.class_id = cs.class_id
       WHERE cs.student_id = ? AND cs.is_active = TRUE
       AND s.day_of_week = DAYOFWEEK(CURRENT_DATE)
       AND s.start_time > CURRENT_TIME
       ORDER BY s.start_time
       LIMIT 3`,
      [studentId]
    );

    const recentGrades = await pool.execute(
      `SELECT
        co.name as subject,
        g.grade,
        g.max_grade as max,
        g.created_at as date
       FROM grades g
       JOIN courses co ON g.course_id = co.id
       WHERE g.student_id = ?
       ORDER BY g.created_at DESC
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
       WHERE student_id = ?
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
      'SELECT first_name as firstName, last_name as lastName FROM users WHERE id = ? AND role = "teacher"',
      [teacherId]
    );

    if (teacher[0].length === 0) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }

    const myClasses = await pool.execute(
      `SELECT COUNT(DISTINCT class_id) as count
       FROM courses
       WHERE teacher_id = ?`,
      [teacherId]
    );

    const coursesThisWeek = await pool.execute(
      `SELECT COUNT(*) as count FROM schedules
       WHERE teacher_id = ?
       AND WEEK(NOW()) = WEEK(CURRENT_DATE)`,
      [teacherId]
    );

    const totalStudents = await pool.execute(
      `SELECT COUNT(DISTINCT cs.student_id) as count
       FROM student_classes cs
       JOIN courses co ON cs.class_id = co.class_id
       WHERE co.teacher_id = ? AND cs.is_active = TRUE`,
      [teacherId]
    );

    const todaySchedule = await pool.execute(
      `SELECT
        DATE_FORMAT(s.start_time, '%H:%i') as time,
        co.name as subject,
        cl.name as class,
        s.room
       FROM schedules s
       JOIN courses co ON s.course_id = co.id
       JOIN classes cl ON s.class_id = cl.id
       WHERE s.teacher_id = ?
       AND s.day_of_week = DAYOFWEEK(CURRENT_DATE)
       ORDER BY s.start_time`,
      [teacherId]
    );

    const attendanceRate = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendances a
       JOIN student_classes cs ON a.student_id = cs.student_id
       JOIN courses co ON cs.class_id = co.class_id
       WHERE co.teacher_id = ?
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
      `SELECT u.id, u.first_name as firstName, u.last_name as lastName, c.name as className
       FROM users u
       JOIN parent_children pc ON u.id = pc.child_id
       JOIN student_classes cs ON u.id = cs.student_id
       JOIN classes c ON cs.class_id = c.id
       WHERE pc.parent_id = ? AND cs.is_active = TRUE`,
      [parentId]
    );

    const unpaidInvoices = await pool.execute(
      `SELECT COUNT(*) as count
       FROM payments p
       JOIN parent_children pc ON p.student_id = pc.child_id
       WHERE pc.parent_id = ? AND p.status = 'pending'`,
      [parentId]
    );

    res.json({
      children: children[0] || [],
      unpaidInvoices: unpaidInvoices[0][0]?.count || 0,
      upcomingEvents: []
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard parent:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
