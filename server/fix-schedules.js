const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixSchedulesTable() {
  let connection;

  try {
    // Configuration de la connexion
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    };

    console.log('Connexion à la base de données...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connecté à la base de données');

    // Lire et exécuter le script SQL
    console.log('\nCorrection de la table schedules...');
    const sqlPath = path.join(__dirname, 'fix-schedules-types.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    await connection.query(sql);
    console.log('✓ Table schedules corrigée avec succès');

    // Vérifier la structure
    console.log('\nVérification de la structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'schedules'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'school_management']);

    console.log('\nStructure de la table schedules :');
    console.table(columns);

    // Vérifier les contraintes de clés étrangères
    const [foreignKeys] = await connection.query(`
      SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'schedules'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME || 'school_management']);

    console.log('\nClés étrangères de la table schedules :');
    console.table(foreignKeys);

    console.log('\n✓ Migration terminée avec succès !');

  } catch (error) {
    console.error('\n✗ Erreur lors de la correction:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnexion fermée');
    }
  }
}

// Exécuter la correction
fixSchedulesTable();
