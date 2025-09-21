const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT id, email, firstName, lastName, role, phone, address, dateOfBirth, isActive, createdAt FROM users WHERE 1=1';
    let params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [users] = await pool.execute(query, params);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    let countParams = [];

    if (role && role !== 'all') {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countQuery += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir un utilisateur par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const [users] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, phone, address, dateOfBirth, isActive, createdAt FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un utilisateur
router.post('/', authenticateToken, requireRole(['admin']), [
  body('email').isEmail().normalizeEmail(),
  body('firstName').isLength({ min: 1 }),
  body('lastName').isLength({ min: 1 }),
  body('role').isIn(['admin', 'teacher', 'student', 'parent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, phone, address, dateOfBirth } = req.body;

    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Mot de passe par défaut
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (email, password, firstName, lastName, role, phone, address, dateOfBirth) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, role, phone, address, dateOfBirth]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: result.insertId,
      defaultPassword
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().isLength({ min: 1 }),
  body('lastName').optional().isLength({ min: 1 }),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent'])
], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, phone, address, dateOfBirth } = req.body;

    // Construire la requête de mise à jour
    let updateFields = [];
    let params = [];

    if (email) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (firstName) {
      updateFields.push('firstName = ?');
      params.push(firstName);
    }
    if (lastName) {
      updateFields.push('lastName = ?');
      params.push(lastName);
    }
    if (role && req.user.role === 'admin') {
      updateFields.push('role = ?');
      params.push(role);
    }
    if (phone) {
      updateFields.push('phone = ?');
      params.push(phone);
    }
    if (address) {
      updateFields.push('address = ?');
      params.push(address);
    }
    if (dateOfBirth) {
      updateFields.push('dateOfBirth = ?');
      params.push(dateOfBirth);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Désactiver plutôt que supprimer
    await pool.execute(
      'UPDATE users SET isActive = FALSE WHERE id = ?',
      [id]
    );

    res.json({ message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;