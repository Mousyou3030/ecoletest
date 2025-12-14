const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { teacherId, level } = req.query;
    
    let query = `
      SELECT c.*,
             CONCAT(u.first_name, ' ', u.last_name) as teacherName,
             COUNT(sc.student_id) as studentCount
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN student_classes sc ON c.id = sc.class_id AND sc.is_active = TRUE
      WHERE 1=1
    `;
    let params = [];

    if (teacherId) {
      query += ' AND c.teacher_id = ?';
      params.push(teacherId);
    }

    if (level) {
      query += ' AND c.level = ?';
      params.push(level);
    }

    query += ' GROUP BY c.id ORDER BY c.level, c.name';

    const [classes] = await pool.execute(query, params);
    res.json(classes);
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir une classe par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [classes] = await pool.execute(`
      SELECT c.*,
             CONCAT(u.first_name, ' ', u.last_name) as teacherName,
             COUNT(sc.student_id) as studentCount
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN student_classes sc ON c.id = sc.class_id AND sc.is_active = TRUE
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (classes.length === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Récupérer les élèves de la classe
    const [students] = await pool.execute(`
      SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, sc.enrollment_date as enrollmentDate
      FROM users u
      JOIN student_classes sc ON u.id = sc.student_id
      WHERE sc.class_id = ? AND sc.is_active = TRUE AND u.is_active = TRUE
      ORDER BY u.last_name, u.first_name
    `, [id]);

    const classData = {
      ...classes[0],
      students
    };

    res.json(classData);
  } catch (error) {
    console.error('Erreur lors de la récupération de la classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une classe
router.post('/', authenticateToken, requireRole(['admin']), [
  body('name').isLength({ min: 1 }),
  body('level').isLength({ min: 1 }),
  body('teacherId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, level, teacherId, capacity, description } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO classes (name, level, teacher_id, capacity, description) VALUES (?, ?, ?, ?, ?)',
      [name, level, teacherId || null, capacity || 30, description || null]
    );

    res.status(201).json({
      message: 'Classe créée avec succès',
      classId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création de la classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour une classe
router.put('/:id', authenticateToken, requireRole(['admin']), [
  body('name').optional().isLength({ min: 1 }),
  body('level').optional().isLength({ min: 1 }),
  body('teacherId').optional().isUUID()
], async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, level, teacherId, capacity, description } = req.body;

    let updateFields = [];
    let params = [];

    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (level) {
      updateFields.push('level = ?');
      params.push(level);
    }
    if (teacherId !== undefined) {
      updateFields.push('teacher_id = ?');
      params.push(teacherId);
    }
    if (capacity) {
      updateFields.push('capacity = ?');
      params.push(capacity);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Classe mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une classe
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la classe existe
    const [classes] = await pool.execute('SELECT id FROM classes WHERE id = ?', [id]);
    if (classes.length === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    await pool.execute('DELETE FROM classes WHERE id = ?', [id]);
    res.json({ message: 'Classe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un élève à une classe
router.post('/:id/students', authenticateToken, requireRole(['admin']), [
  body('studentId').isUUID()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Vérifier que l'élève existe et est bien un élève
    const [students] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND role = "student" AND is_active = TRUE',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    // Vérifier que l'élève n'est pas déjà dans la classe
    const [existing] = await pool.execute(
      'SELECT id FROM student_classes WHERE student_id = ? AND class_id = ? AND is_active = TRUE',
      [studentId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'L\'élève est déjà dans cette classe' });
    }

    await pool.execute(
      'INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)',
      [studentId, id]
    );

    res.json({ message: 'Élève ajouté à la classe avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'élève à la classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Retirer un élève d'une classe
router.delete('/:id/students/:studentId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id, studentId } = req.params;

    await pool.execute(
      'UPDATE student_classes SET is_active = FALSE WHERE student_id = ? AND class_id = ?',
      [studentId, id]
    );

    res.json({ message: 'Élève retiré de la classe avec succès' });
  } catch (error) {
    console.error('Erreur lors du retrait de l\'élève de la classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;