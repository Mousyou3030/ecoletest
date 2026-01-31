const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate: auth } = require('../middleware/auth');
const os = require('os');

router.get('/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const [dbStatus] = await db.query('SELECT 1 as status');

    const uptime = process.uptime();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const status = {
      server: {
        status: 'operational',
        uptime: Math.floor(uptime),
        uptimeFormatted: formatUptime(uptime),
        platform: os.platform(),
        nodeVersion: process.version
      },
      database: {
        status: dbStatus.length > 0 ? 'connected' : 'disconnected',
        type: 'MySQL'
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 100)
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadAverage: os.loadavg()
      }
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du statut système' });
  }
});

router.get('/logs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { limit = 100, level } = req.query;

    let query = 'SELECT * FROM system_logs WHERE 1=1';
    const params = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [logs] = await db.query(query, params);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des logs' });
  }
});

router.get('/users-activity', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const [activeUsers] = await db.query(`
      SELECT
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as last_24h,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as last_7days,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as last_30days
      FROM users
      WHERE last_login IS NOT NULL
    `);

    const [recentActivity] = await db.query(`
      SELECT
        u.full_name,
        u.role,
        u.last_login,
        u.email
      FROM users u
      WHERE u.last_login IS NOT NULL
      ORDER BY u.last_login DESC
      LIMIT 20
    `);

    const [byRole] = await db.query(`
      SELECT
        role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users
      FROM users
      GROUP BY role
    `);

    res.json({
      summary: activeUsers[0],
      recentActivity,
      byRole
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'activité utilisateur' });
  }
});

router.get('/performance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const [dbSize] = await db.query(`
      SELECT
        table_schema as 'database',
        SUM(data_length + index_length) as size_bytes,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
      GROUP BY table_schema
    `);

    const [tableSizes] = await db.query(`
      SELECT
        table_name,
        ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb,
        table_rows
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
      LIMIT 10
    `);

    res.json({
      database: dbSize[0] || {},
      tables: tableSizes
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données de performance' });
  }
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

module.exports = router;
