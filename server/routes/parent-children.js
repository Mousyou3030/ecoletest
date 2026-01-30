const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [relationships] = await pool.execute(`
      SELECT
        pc.id,
        pc.parentId,
        pc.childId,
        pc.relationship,
        CONCAT(p.firstName, ' ', p.lastName) as parentName,
        CONCAT(c.firstName, ' ', c.lastName) as childName
      FROM parent_children pc
      JOIN users p ON pc.parentId = p.id
      JOIN users c ON pc.childId = c.id
      ORDER BY parentName, childName
    `);

    res.json(relationships);
  } catch (error) {
    console.error('Erreur lors de la récupération des relations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/parent/:parentId', authenticateToken, async (req, res) => {
  try {
    const { parentId } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== parentId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const [children] = await pool.execute(`
      SELECT
        c.id,
        c.firstName,
        c.lastName,
        c.email,
        c.dateOfBirth,
        pc.relationship
      FROM parent_children pc
      JOIN users c ON pc.childId = c.id
      WHERE pc.parentId = ?
    `, [parentId]);

    res.json(children);
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { parentId, childId, relationship } = req.body;

    if (!parentId || !childId || !relationship) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    const [parentCheck] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [parentId]
    );

    if (parentCheck.length === 0) {
      return res.status(404).json({ error: 'Parent non trouvé' });
    }

    if (parentCheck[0].role !== 'parent') {
      return res.status(400).json({ error: 'L\'utilisateur sélectionné n\'est pas un parent' });
    }

    const [childCheck] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [childId]
    );

    if (childCheck.length === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    if (childCheck[0].role !== 'student') {
      return res.status(400).json({ error: 'L\'utilisateur sélectionné n\'est pas un élève' });
    }

    const [existingRelation] = await pool.execute(
      'SELECT id FROM parent_children WHERE parentId = ? AND childId = ?',
      [parentId, childId]
    );

    if (existingRelation.length > 0) {
      return res.status(400).json({ error: 'Cette relation existe déjà' });
    }

    const relationId = uuidv4();

    await pool.execute(
      'INSERT INTO parent_children (id, parentId, childId, relationship, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [relationId, parentId, childId, relationship]
    );

    res.status(201).json({
      message: 'Relation créée avec succès',
      id: relationId
    });
  } catch (error) {
    console.error('Erreur lors de la création de la relation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM parent_children WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Relation non trouvée' });
    }

    res.json({ message: 'Relation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la relation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
