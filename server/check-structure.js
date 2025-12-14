const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseStructure() {
  let connection;

  try {
    console.log('🔍 Connexion à la base de données...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connexion réussie à:', process.env.DB_NAME);
    console.log('\n📋 Liste des tables:\n');

    const [tables] = await connection.execute(
      'SHOW TABLES'
    );

    if (tables.length === 0) {
      console.log('⚠️  Aucune table trouvée dans la base de données.');
      console.log('Vous devez importer le fichier database-schema.sql');
      return;
    }

    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📌 Table: ${tableName}`);

      const [columns] = await connection.execute(
        `DESCRIBE ${tableName}`
      );

      console.log('   Colonnes:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Key ? '[' + col.Key + ']' : ''}`);
      });

      const [count] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      console.log(`   Nombre de lignes: ${count[0].count}`);
    }

    console.log('\n✅ Structure de la base vérifiée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Vérifiez que MySQL est démarré');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Vérifiez les credentials dans le fichier .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solution: La base de données "' + process.env.DB_NAME + '" n\'existe pas');
      console.log('Créez-la avec: CREATE DATABASE ' + process.env.DB_NAME + ';');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure();
