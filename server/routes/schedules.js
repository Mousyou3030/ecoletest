const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les créneaux
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { class_id, teacher_id, day } = req.query;
    
    let query = `
      SELECT s.*, 
             CONCAT(u.first_name, ' ', u.last_name) as teacherName,
             c.name as className
      FROM schedules s
      LEFT JOIN users u ON s.teacher_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    let params = [];

    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(class_id);
    }

    if (teacher_id) {
      query += ' AND s.teacher_id = ?';
      params.push(teacher_id);
    }

    if (day) {
      query += ' AND s.day = ?';
      params.push(day);
    }

    query += ' ORDER BY FIELD(s.day, "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"), s.start_time';

    const [schedules] = await pool.execute(query, params);
    res.json(schedules);
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un créneau
router.post('/', authenticateToken, requireRole(['admin']), [
  body('day').isIn(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('subject').isLength({ min: 1 }),
  body('teacher_id').isUUID(),
  body('class_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { day, start_time, end_time, subject, teacher_id, class_id, room } = req.body;

    // Vérifier les conflits d'horaires
    const [conflicts] = await pool.execute(
      `SELECT id FROM schedules 
       WHERE ((teacher_id = ? AND day = ? AND start_time < ? AND end_time > ?) 
              OR (class_id = ? AND day = ? AND start_time < ? AND end_time > ?))
`,
      [teacher_id, day, end_time, start_time, class_id, day, end_time, start_time]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'Conflit d\'horaire détecté' });
    }

    const [result] = await pool.execute(
      `INSERT INTO schedules (id, day, start_time, end_time, subject, teacher_id, class_id, room) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
      [day, start_time, end_time, subject, teacher_id, class_id, room || null]
    );

    res.status(201).json({
      message: 'Créneau créé avec succès',
      scheduleId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création du créneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un créneau
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'DELETE FROM schedules WHERE id = ?',
      [id]
    );

    res.json({ message: 'Créneau supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du créneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;