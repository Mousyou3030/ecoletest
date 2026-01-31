const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate: auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { recipientId, senderId, userId } = req.query;

    let query = `
      SELECT
        m.*,
        sender.full_name as sender_name,
        recipient.full_name as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.senderId = sender.id
      LEFT JOIN users recipient ON m.receiverId = recipient.id
      WHERE 1=1
    `;

    const params = [];

    if (userId) {
      query += ' AND (m.receiverId = ? OR m.senderId = ?)';
      params.push(userId, userId);
    } else {
      if (recipientId) {
        query += ' AND m.receiverId = ?';
        params.push(recipientId);
      }

      if (senderId) {
        query += ' AND m.senderId = ?';
        params.push(senderId);
      }
    }

    query += ' ORDER BY m.createdAt DESC';

    const [messages] = await pool.execute(query, params);

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      content: msg.content,
      senderName: msg.sender_name,
      recipientName: msg.recipient_name,
      date: msg.createdAt,
      read: msg.isRead,
      senderId: msg.senderId,
      recipientId: msg.receiverId
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [messages] = await pool.execute(
      `SELECT
        m.*,
        sender.full_name as sender_name,
        recipient.full_name as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.senderId = sender.id
      LEFT JOIN users recipient ON m.receiverId = recipient.id
      WHERE m.id = ?`,
      [req.params.id]
    );

    if (messages.length === 0) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    res.json(messages[0]);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du message' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { recipient_id, subject, content } = req.body;

    if (!recipient_id || !subject || !content) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

    const [result] = await pool.execute(
      `INSERT INTO messages (senderId, receiverId, subject, content, isRead)
       VALUES (?, ?, ?, ?, false)`,
      [req.user.id, recipient_id, subject, content]
    );

    const [newMessage] = await pool.execute(
      `SELECT
        m.*,
        sender.full_name as sender_name,
        recipient.full_name as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.senderId = sender.id
      LEFT JOIN users recipient ON m.receiverId = recipient.id
      WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Erreur lors de la création du message' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE messages SET isRead = true WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du message' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du message' });
  }
});

module.exports = router;
