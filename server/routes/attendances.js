const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Récupérer toutes les présences avec filtres
router.get('/', authenticate, async (req, res) => {
  try {
    const { class_id, date, status, student_id } = req.query;

    let query = `
      SELECT
        a.id,
        a.student_id,
        a.class_id,
        a.date,
        a.status,
        a.notes,
        a.created_at,
        u.first_name,
        u.last_name,
        u.email,
        c.name as class_name
      FROM attendances a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY a.date DESC, u.last_name ASC';

    const [attendances] = await pool.execute(query, params);

    res.json({
      success: true,
      data: attendances
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des présences:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des présences'
    });
  }
});

// Récupérer les statistiques de présence
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { class_id, date, start_date, end_date } = req.query;

    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendances
      WHERE 1=1
    `;

    const params = [];

    if (class_id) {
      query += ' AND class_id = ?';
      params.push(class_id);
    }

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    } else if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [stats] = await pool.execute(query, params);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Créer ou mettre à jour une présence
router.post('/', authenticate, async (req, res) => {
  try {
    const { student_id, class_id, date, status, notes } = req.body;

    if (!student_id || !date || !status) {
      return res.status(400).json({
        success: false,
        error: 'Les champs student_id, date et status sont requis'
      });
    }

    // Vérifier si une présence existe déjà
    const [existing] = await pool.execute(
      'SELECT id FROM attendances WHERE student_id = ? AND date = ? AND class_id = ?',
      [student_id, date, class_id]
    );

    if (existing.length > 0) {
      // Mettre à jour
      await pool.execute(
        'UPDATE attendances SET status = ?, notes = ?, marked_by = ?, updated_at = NOW() WHERE id = ?',
        [status, notes || null, req.user.id, existing[0].id]
      );

      res.json({
        success: true,
        message: 'Présence mise à jour avec succès',
        data: { id: existing[0].id, student_id, date, status, notes }
      });
    } else {
      // Créer
      const [result] = await pool.execute(
        'INSERT INTO attendances (student_id, class_id, date, status, notes, marked_by) VALUES (?, ?, ?, ?, ?, ?)',
        [student_id, class_id || null, date, status, notes || null, req.user.id]
      );

      res.status(201).json({
        success: true,
        message: 'Présence créée avec succès',
        data: { id: result.insertId, student_id, class_id, date, status, notes }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de la présence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création/mise à jour de la présence'
    });
  }
});

// Mettre à jour une présence
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Le champ status est requis'
      });
    }

    const [result] = await pool.execute(
      'UPDATE attendances SET status = ?, notes = ?, marked_by = ?, updated_at = NOW() WHERE id = ?',
      [status, notes || null, req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Présence non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Présence mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la présence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la présence'
    });
  }
});

// Supprimer une présence
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM attendances WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Présence non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Présence supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la présence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la présence'
    });
  }
});

// Marquer les présences pour toute une classe
router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { class_id, date, attendances } = req.body;

    if (!class_id || !date || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({
        success: false,
        error: 'Les champs class_id, date et attendances (array) sont requis'
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const att of attendances) {
        const { student_id, status, notes } = att;

        // Vérifier si existe déjà
        const [existing] = await connection.execute(
          'SELECT id FROM attendances WHERE student_id = ? AND date = ? AND class_id = ?',
          [student_id, date, class_id]
        );

        if (existing.length > 0) {
          await connection.execute(
            'UPDATE attendances SET status = ?, notes = ?, marked_by = ?, updated_at = NOW() WHERE id = ?',
            [status, notes || null, req.user.id, existing[0].id]
          );
        } else {
          await connection.execute(
            'INSERT INTO attendances (student_id, class_id, date, status, notes, marked_by) VALUES (?, ?, ?, ?, ?, ?)',
            [student_id, class_id, date, status, notes || null, req.user.id]
          );
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: `${attendances.length} présences enregistrées avec succès`
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement en masse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement en masse'
    });
  }
});

module.exports = router;
