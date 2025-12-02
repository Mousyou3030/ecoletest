const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les cours
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { teacherId, classId, subject } = req.query;
    
    let query = `
      SELECT c.*,
             CONCAT(u.\`firstName\`, ' ', u.\`lastName\`) as teacherName,
             cl.\`name\` as className
      FROM courses c
      LEFT JOIN users u ON c.\`teacherId\` = u.\`id\`
      LEFT JOIN classes cl ON c.\`classId\` = cl.\`id\`
      WHERE c.\`isActive\` = TRUE
    `;
    let params = [];

    if (teacherId) {
      query += ' AND c.`teacherId` = ?';
      params.push(teacherId);
    }

    if (classId) {
      query += ' AND c.`classId` = ?';
      params.push(classId);
    }

    if (subject) {
      query += ' AND c.`subject` = ?';
      params.push(subject);
    }

    query += ' ORDER BY c.`createdAt` DESC';

    const [courses] = await pool.execute(query, params);
    res.json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un cours
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), [
  body('title').isLength({ min: 1 }),
  body('subject').isLength({ min: 1 }),
  body('teacherId').isUUID(),
  body('classId').isUUID(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, teacherId, classId, startDate, endDate, materials } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO courses (\`id\`, \`title\`, \`description\`, \`subject\`, \`teacherId\`, \`classId\`, \`startDate\`, \`endDate\`, \`materials\`)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, subject, teacherId, classId, startDate, endDate, JSON.stringify(materials || [])]
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
    const { title, description, subject, teacherId, classId, startDate, endDate, materials } = req.body;

    let updateFields = [];
    let params = [];

    if (title) {
      updateFields.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (subject) {
      updateFields.push('subject = ?');
      params.push(subject);
    }
    if (teacherId) {
      updateFields.push('teacherId = ?');
      params.push(teacherId);
    }
    if (classId) {
      updateFields.push('classId = ?');
      params.push(classId);
    }
    if (startDate) {
      updateFields.push('startDate = ?');
      params.push(startDate);
    }
    if (endDate) {
      updateFields.push('endDate = ?');
      params.push(endDate);
    }
    if (materials) {
      updateFields.push('materials = ?');
      params.push(JSON.stringify(materials));
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
      'UPDATE courses SET isActive = FALSE WHERE id = ?',
      [id]
    );

    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;