const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate: auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM settings ORDER BY category, setting_key');

    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }

      let value = setting.setting_value;
      try {
        value = JSON.parse(value);
      } catch (e) {
        value = setting.setting_value;
      }

      acc[setting.category][setting.setting_key] = value;
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const settingsData = req.body;

    for (const category in settingsData) {
      for (const key in settingsData[category]) {
        const value = typeof settingsData[category][key] === 'object'
          ? JSON.stringify(settingsData[category][key])
          : String(settingsData[category][key]);

        await pool.execute(
          `INSERT INTO settings (category, setting_key, setting_value)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [category, key, value, value]
        );
      }
    }

    res.json({ message: 'Paramètres sauvegardés avec succès' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde des paramètres' });
  }
});

router.get('/:category', auth, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM settings WHERE category = ?',
      [req.params.category]
    );

    const result = settings.reduce((acc, setting) => {
      let value = setting.setting_value;
      try {
        value = JSON.parse(value);
      } catch (e) {
        value = setting.setting_value;
      }
      acc[setting.setting_key] = value;
      return acc;
    }, {});

    res.json(result);
  } catch (error) {
    console.error('Error fetching category settings:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' });
  }
});

module.exports = router;
