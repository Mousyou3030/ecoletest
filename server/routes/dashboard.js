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
      'SELECT COUNT(*) as count FROM classes WHERE isActive = TRUE'
    );

    const recentActivity = await pool.execute(
      `SELECT
        CASE
          WHEN type = 'enrollment' THEN 'Nouvelle inscription'
          WHEN type = 'absence' THEN 'Absence signalée'
          WHEN type = 'payment' THEN 'Paiement reçu'
          WHEN type = 'grade' THEN 'Note ajoutée'
          ELSE 'Activité'
        END as action,
        CONCAT(firstName, ' ', lastName) as user,
        createdAt,
        type
       FROM activities
       ORDER BY createdAt DESC
       LIMIT 5`
    );

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
      recentActivity: recentActivity[0] || []
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
       JOIN courses c ON s.courseId = c.id
       JOIN users u ON c.teacherId = u.id
       WHERE s.classId IN (
         SELECT classId FROM class_students WHERE studentId = ?
       )
       AND s.startTime > NOW()
       ORDER BY s.startTime
       LIMIT 3`,
      [studentId]
    );

    const recentGrades = await pool.execute(
      `SELECT
        c.name as subject,
        g.score as grade,
        g.maxScore as max,
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
       FROM assignments a
       JOIN courses c ON a.courseId = c.id
       WHERE a.classId IN (
         SELECT classId FROM class_students WHERE studentId = ?
       )
       AND a.dueDate > NOW()
       ORDER BY a.dueDate
       LIMIT 3`,
      [studentId]
    );

    const averageGrade = recentGrades[0].length > 0
      ? (recentGrades[0].reduce((acc, g) => acc + g.grade, 0) / recentGrades[0].length).toFixed(1)
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
       WHERE courseId IN (SELECT id FROM courses WHERE teacherId = ?)
       AND startTime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`,
      [teacherId]
    );

    const totalStudents = await pool.execute(
      `SELECT COUNT(DISTINCT cs.studentId) as count
       FROM class_students cs
       WHERE cs.classId IN (
         SELECT id FROM classes WHERE id IN (
           SELECT classId FROM course_classes WHERE courseId IN (
             SELECT id FROM courses WHERE teacherId = ?
           )
         )
       )`,
      [teacherId]
    );

    const todaySchedule = await pool.execute(
      `SELECT
        s.startTime as time,
        c.name as subject,
        cl.name as class,
        s.room
       FROM schedules s
       JOIN courses c ON s.courseId = c.id
       JOIN classes cl ON s.classId = cl.id
       WHERE c.teacherId = ?
       AND DATE(s.startTime) = DATE(NOW())
       ORDER BY s.startTime`,
      [teacherId]
    );

    const upcomingTasks = await pool.execute(
      `SELECT
        title as task,
        dueDate as deadline,
        priority
       FROM tasks
       WHERE teacherId = ?
       AND dueDate > NOW()
       ORDER BY dueDate
       LIMIT 4`,
      [teacherId]
    );

    res.json({
      teacher: teacher[0][0],
      myClasses: myClasses[0][0]?.count || 0,
      coursesThisWeek: coursesThisWeek[0][0]?.count || 0,
      totalStudents: totalStudents[0][0]?.count || 0,
      attendanceRate: 92,
      todaySchedule: todaySchedule[0] || [],
      upcomingTasks: upcomingTasks[0] || []
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
       JOIN class_students cs ON u.id = cs.studentId
       JOIN classes c ON cs.classId = c.id
       WHERE u.parentId = ? AND u.isActive = TRUE`,
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
