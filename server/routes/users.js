const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, search, page, limit } = req.query;

    let query = 'SELECT id, email, first_name, last_name, role, phone, address, date_of_birth, created_at FROM users WHERE 1=1';
    let params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    // Only add pagination if both page and limit are provided
    if (page && limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      query += ' LIMIT ? OFFSET ?';
      params.push(limitNum, (pageNum - 1) * limitNum);
    }

    const [users] = await pool.execute(query, params);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    let countParams = [];

    if (role && role !== 'all') {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
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
      'SELECT id, email, first_name, last_name, role, phone, address, date_of_birth, created_at FROM users WHERE id = ?',
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
  body('first_name').isLength({ min: 1 }),
  body('last_name').isLength({ min: 1 }),
  body('role').isIn(['admin', 'teacher', 'student', 'parent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, first_name, last_name, role, phone, address, date_of_birth } = req.body;

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
    const userId = uuidv4();

    const [result] = await pool.execute(
      `INSERT INTO users (id, email, password, first_name, last_name, role, phone, address, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, first_name, last_name, role, phone, address, date_of_birth]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId,
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
  body('first_name').optional().isLength({ min: 1 }),
  body('last_name').optional().isLength({ min: 1 }),
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

    const { email, first_name, last_name, role, phone, address, date_of_birth } = req.body;

    // Construire la requête de mise à jour
    let updateFields = [];
    let params = [];

    if (email) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (first_name) {
      updateFields.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      params.push(last_name);
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
    if (date_of_birth) {
      updateFields.push('date_of_birth = ?');
      params.push(date_of_birth);
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

// Changer le mot de passe
router.put('/:id/password', authenticateToken, [
  body('currentPassword').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Récupérer l'utilisateur
    const [users] = await pool.execute(
      'SELECT id, password FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    // Vérifier le mot de passe actuel
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Le mot de passe actuel est incorrect' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
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

    // Supprimer l'utilisateur
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    res.json({ message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;