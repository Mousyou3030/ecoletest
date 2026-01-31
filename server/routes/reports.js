const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate: auth } = require('../middleware/auth');

router.get('/academic', auth, async (req, res) => {
  try {
    const { classId, courseId, startDate, endDate } = req.query;

    let query = `
      SELECT
        c.name as class_name,
        co.name as course_name,
        u.full_name as student_name,
        AVG(g.grade) as average_grade,
        COUNT(g.id) as total_grades,
        MAX(g.grade) as max_grade,
        MIN(g.grade) as min_grade
      FROM grades g
      JOIN users u ON g.student_id = u.id
      JOIN courses co ON g.course_id = co.id
      JOIN classes c ON u.class_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (classId) {
      query += ' AND c.id = ?';
      params.push(classId);
    }

    if (courseId) {
      query += ' AND co.id = ?';
      params.push(courseId);
    }

    if (startDate) {
      query += ' AND g.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND g.created_at <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY c.id, co.id, u.id ORDER BY average_grade DESC';

    const [results] = await pool.execute(query, params);

    const summary = {
      totalStudents: results.length,
      overallAverage: results.reduce((sum, r) => sum + parseFloat(r.average_grade || 0), 0) / results.length || 0,
      highestAverage: Math.max(...results.map(r => parseFloat(r.average_grade || 0))),
      lowestAverage: Math.min(...results.map(r => parseFloat(r.average_grade || 0)))
    };

    res.json({
      summary,
      details: results
    });
  } catch (error) {
    console.error('Error generating academic report:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport académique' });
  }
});

router.get('/attendance', auth, async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    let query = `
      SELECT
        c.name as class_name,
        u.full_name as student_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
        COUNT(a.id) as total_sessions,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)), 2) as attendance_rate
      FROM attendances a
      JOIN users u ON a.student_id = u.id
      JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (classId) {
      query += ' AND c.id = ?';
      params.push(classId);
    }

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY c.id, u.id ORDER BY attendance_rate DESC';

    const [results] = await pool.execute(query, params);

    const summary = {
      totalStudents: results.length,
      averageAttendanceRate: results.reduce((sum, r) => sum + parseFloat(r.attendance_rate || 0), 0) / results.length || 0,
      totalAbsences: results.reduce((sum, r) => sum + parseInt(r.absent_count || 0), 0),
      totalLates: results.reduce((sum, r) => sum + parseInt(r.late_count || 0), 0)
    };

    res.json({
      summary,
      details: results
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport de présence' });
  }
});

router.get('/financial', auth, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let query = `
      SELECT
        u.full_name as student_name,
        c.name as class_name,
        p.amount,
        p.status,
        p.payment_date,
        p.payment_method,
        p.description
      FROM payments p
      JOIN users u ON p.student_id = u.id
      LEFT JOIN classes c ON u.class_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND p.payment_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND p.payment_date <= ?';
      params.push(endDate);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.payment_date DESC';

    const [results] = await pool.execute(query, params);

    const summary = {
      totalPayments: results.length,
      totalAmount: results.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
      paidAmount: results.filter(r => r.status === 'paid').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
      pendingAmount: results.filter(r => r.status === 'pending').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
      overdueAmount: results.filter(r => r.status === 'overdue').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
    };

    res.json({
      summary,
      details: results
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport financier' });
  }
});

router.get('/enrollment', auth, async (req, res) => {
  try {
    const [classCounts] = await pool.execute(`
      SELECT
        c.name as class_name,
        c.level,
        COUNT(u.id) as student_count,
        c.capacity,
        ROUND((COUNT(u.id) * 100.0 / c.capacity), 2) as fill_rate
      FROM classes c
      LEFT JOIN users u ON u.class_id = c.id AND u.role = 'student'
      GROUP BY c.id
      ORDER BY c.level, c.name
    `);

    const [totalStats] = await pool.execute(`
      SELECT
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as total_teachers,
        COUNT(CASE WHEN role = 'parent' THEN 1 END) as total_parents
      FROM users
    `);

    const summary = {
      totalStudents: totalStats[0].total_students,
      totalTeachers: totalStats[0].total_teachers,
      totalParents: totalStats[0].total_parents,
      totalClasses: classCounts.length,
      averageFillRate: classCounts.reduce((sum, c) => sum + parseFloat(c.fill_rate || 0), 0) / classCounts.length || 0
    };

    res.json({
      summary,
      classes: classCounts
    });
  } catch (error) {
    console.error('Error generating enrollment report:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport d\'inscription' });
  }
});

module.exports = router;
