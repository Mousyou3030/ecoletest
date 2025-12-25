const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les cours
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, class_id, subject } = req.query;

    let query = `
      SELECT c.*,
             CONCAT(u.first_name, ' ', u.last_name) as teacherName,
             cl.name as className
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE 1=1
    `;
    let params = [];

    if (teacher_id) {
      query += ' AND c.teacher_id = ?';
      params.push(teacher_id);
    }

    if (class_id) {
      query += ' AND c.class_id = ?';
      params.push(class_id);
    }

    if (subject) {
      query += ' AND c.subject = ?';
      params.push(subject);
    }

    query += ' ORDER BY c.created_at DESC';

    console.log('Courses Query:', query);
    console.log('Courses Params:', params);
    const [courses] = await pool.execute(query, params);
    console.log('Courses Found:', courses.length);
    res.json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Créer un cours
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), [
  body('name').isLength({ min: 1 }),
  body('subject').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      console.error('Request body:', req.body);
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: errors.array()
      });
    }

    const { name, description, subject, teacher_id, class_id, credits } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO courses (name, description, subject, teacher_id, class_id, credits)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, subject, teacher_id || null, class_id || null, credits || 1]
    );

    res.status(201).json({
      message: 'Cours créé avec succès',
      courseId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un cours
router.put('/:id', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subject, teacher_id, class_id, credits } = req.body;

    let updateFields = [];
    let params = [];

    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (subject) {
      updateFields.push('subject = ?');
      params.push(subject);
    }
    if (teacher_id) {
      updateFields.push('teacher_id = ?');
      params.push(teacher_id);
    }
    if (class_id) {
      updateFields.push('class_id = ?');
      params.push(class_id);
    }
    if (credits) {
      updateFields.push('credits = ?');
      params.push(credits);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Cours mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un cours
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'DELETE FROM courses WHERE id = ?',
      [id]
    );

    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;