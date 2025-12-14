const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les notes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, course_id, teacher_id, type, class_id } = req.query;
    
    let query = `
      SELECT g.*, 
             CONCAT(s.first_name, ' ', s.last_name) as studentName,
             CONCAT(t.first_name, ' ', t.last_name) as teacherName,
             c.title as courseTitle,
             c.subject,
             cl.name as className
      FROM grades g
      LEFT JOIN users s ON g.student_id = s.id
      LEFT JOIN users t ON g.teacher_id = t.id
      LEFT JOIN courses c ON g.course_id = c.id
      LEFT JOIN student_classes sc ON s.id = sc.student_id AND sc.is_active = TRUE
      LEFT JOIN classes cl ON sc.class_id = cl.id
      WHERE 1=1
    `;
    let params = [];

    if (student_id) {
      query += ' AND g.student_id = ?';
      params.push(student_id);
    }

    if (course_id) {
      query += ' AND g.course_id = ?';
      params.push(course_id);
    }

    if (teacher_id) {
      query += ' AND g.teacher_id = ?';
      params.push(teacher_id);
    }

    if (type && type !== 'all') {
      query += ' AND g.type = ?';
      params.push(type);
    }

    if (class_id) {
      query += ' AND cl.id = ?';
      params.push(class_id);
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
  body('student_id').isUUID(),
  body('course_id').isUUID(),
  body('value').isFloat({ min: 0 }),
  body('max_value').isFloat({ min: 0.1 }),
  body('type').isIn(['exam', 'homework', 'participation', 'project']),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, course_id, value, max_value, type, date, comments } = req.body;
    const teacher_id = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO grades (\`id\`, \`student_id\`, \`course_id\`, \`teacher_id\`, \`value\`, \`max_value\`, \`type\`, \`date\`, \`comments\`)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, course_id, teacher_id, value, max_value, type, date, comments || null]
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
    const { value, max_value, type, date, comments } = req.body;

    let updateFields = [];
    let params = [];

    if (value !== undefined) {
      updateFields.push('`value` = ?');
      params.push(value);
    }
    if (max_value !== undefined) {
      updateFields.push('`max_value` = ?');
      params.push(max_value);
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