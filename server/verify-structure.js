const { pool } = require('./config/database');

async function verifyStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table users...\n');

    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'myscols' AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Colonnes de la table users:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

verifyStructure();
