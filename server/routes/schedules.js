const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les créneaux
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { classId, teacherId, day } = req.query;
    
    let query = `
      SELECT s.*, 
             CONCAT(u.firstName, ' ', u.lastName) as teacherName,
             c.name as className
      FROM schedules s
      LEFT JOIN users u ON s.teacherId = u.id
      LEFT JOIN classes c ON s.classId = c.id
      WHERE 1=1
    `;
    let params = [];

    if (classId) {
      query += ' AND s.classId = ?';
      params.push(classId);
    }

    if (teacherId) {
      query += ' AND s.teacherId = ?';
      params.push(teacherId);
    }

    if (day) {
      query += ' AND s.day = ?';
      params.push(day);
    }

    query += ' ORDER BY FIELD(s.day, "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"), s.startTime';

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
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('subject').isLength({ min: 1 }),
  body('teacherId').isUUID(),
  body('classId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { day, startTime, endTime, subject, teacherId, classId, room } = req.body;

    // Vérifier les conflits d'horaires
    const [conflicts] = await pool.execute(
      `SELECT id FROM schedules 
       WHERE ((teacherId = ? AND day = ? AND startTime < ? AND endTime > ?) 
              OR (classId = ? AND day = ? AND startTime < ? AND endTime > ?))
`,
      [teacherId, day, endTime, startTime, classId, day, endTime, startTime]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'Conflit d\'horaire détecté' });
    }

    const [result] = await pool.execute(
      `INSERT INTO schedules (id, day, startTime, endTime, subject, teacherId, classId, room) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
      [day, startTime, endTime, subject, teacherId, classId, room || null]
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