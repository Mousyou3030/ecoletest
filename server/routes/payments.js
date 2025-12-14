const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les paiements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, student_id } = req.query;
    
    let query = `
      SELECT p.*, 
             CONCAT(u.first_name, ' ', u.last_name) as studentName,
             c.name as className
      FROM payments p
      LEFT JOIN users u ON p.student_id = u.id
      LEFT JOIN student_classes sc ON u.id = sc.student_id AND sc.is_active = TRUE
      LEFT JOIN classes c ON sc.class_id = c.id
      WHERE 1=1
    `;
    let params = [];

    if (status && status !== 'all') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ' AND p.type = ?';
      params.push(type);
    }

    if (student_id) {
      query += ' AND p.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY p.created_at DESC';

    const [payments] = await pool.execute(query, params);
    res.json(payments);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un paiement
router.post('/', authenticateToken, requireRole(['admin']), [
  body('student_id').isUUID(),
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['tuition', 'canteen', 'transport', 'materials', 'other']),
  body('due_date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, amount, type, due_date, description, status } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO payments (id, student_id, amount, type, due_date, description, status) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
      [student_id, amount, type, due_date, description || null, status || 'pending']
    );

    res.status(201).json({
      message: 'Paiement créé avec succès',
      paymentId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un paiement
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paid_date, method } = req.body;

    let updateFields = [];
    let params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    if (paid_date) {
      updateFields.push('paid_date = ?');
      params.push(paid_date);
    }
    if (method) {
      updateFields.push('method = ?');
      params.push(method);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Paiement mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;