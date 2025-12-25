const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les notes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, courseId, teacherId, type, classId } = req.query;

    let query = `
      SELECT g.*,
             CONCAT(s.firstName, ' ', s.lastName) as studentName,
             CONCAT(t.firstName, ' ', t.lastName) as teacherName,
             c.title as courseTitle,
             c.subject,
             cl.name as className
      FROM grades g
      LEFT JOIN users s ON g.studentId = s.id
      LEFT JOIN users t ON g.teacherId = t.id
      LEFT JOIN courses c ON g.courseId = c.id
      LEFT JOIN class_students cs ON s.id = cs.studentId AND cs.isActive = TRUE
      LEFT JOIN classes cl ON cs.classId = cl.id
      WHERE 1=1
    `;
    let params = [];

    if (studentId) {
      query += ' AND g.studentId = ?';
      params.push(studentId);
    }

    if (courseId) {
      query += ' AND g.courseId = ?';
      params.push(courseId);
    }

    if (teacherId) {
      query += ' AND g.teacherId = ?';
      params.push(teacherId);
    }

    if (type && type !== 'all') {
      query += ' AND g.type = ?';
      params.push(type);
    }

    if (classId) {
      query += ' AND cl.id = ?';
      params.push(classId);
    }

    query += ' ORDER BY g.date DESC';

    const [grades] = await pool.execute(query, params);
    res.json(grades);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une note
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), [
  body('studentId').isUUID(),
  body('courseId').isUUID(),
  body('value').isFloat({ min: 0 }),
  body('maxValue').isFloat({ min: 0.1 }),
  body('type').isIn(['exam', 'homework', 'participation', 'project']),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, courseId, value, maxValue, type, date, comments } = req.body;
    const teacherId = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO grades (\`id\`, \`studentId\`, \`courseId\`, \`teacherId\`, \`value\`, \`maxValue\`, \`type\`, \`date\`, \`comments\`)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, courseId, teacherId, value, maxValue, type, date, comments || null]
    );

    res.status(201).json({
      message: 'Note créée avec succès',
      gradeId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour une note
router.put('/:id', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { value, maxValue, type, date, comments } = req.body;

    let updateFields = [];
    let params = [];

    if (value !== undefined) {
      updateFields.push('`value` = ?');
      params.push(value);
    }
    if (maxValue !== undefined) {
      updateFields.push('`maxValue` = ?');
      params.push(maxValue);
    }
    if (type) {
      updateFields.push('`type` = ?');
      params.push(type);
    }
    if (date) {
      updateFields.push('`date` = ?');
      params.push(date);
    }
    if (comments !== undefined) {
      updateFields.push('`comments` = ?');
      params.push(comments);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE grades SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Note mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une note
router.delete('/:id', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM grades WHERE id = ?', [id]);

    res.json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
