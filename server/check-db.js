const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'myscols',
    });

    console.log('✅ Connexion à MySQL réussie\n');

    // Lister toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables disponibles:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });
    console.log('');

    // Chercher les tables liées aux présences
    const tableNames = tables.map(t => Object.values(t)[0]);
    const attendanceTables = tableNames.filter(name =>
      name.toLowerCase().includes('attendance') ||
      name.toLowerCase().includes('presence') ||
      name.toLowerCase().includes('assiduite')
    );

    if (attendanceTables.length > 0) {
      console.log('📊 Tables de présences trouvées:');
      for (const tableName of attendanceTables) {
        console.log(`\n   Table: ${tableName}`);
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('   Colonnes:');
        columns.forEach(col => {
          console.log(`      - ${col.Field} (${col.Type})`);
        });
      }
    } else {
      console.log('⚠️  Aucune table de présences trouvée');
    }

    // Chercher les tables d'étudiants
    const studentTables = tableNames.filter(name =>
      name.toLowerCase().includes('student') ||
      name.toLowerCase().includes('eleve') ||
      name.toLowerCase().includes('etudiant')
    );

    if (studentTables.length > 0) {
      console.log('\n👨‍🎓 Tables d\'étudiants trouvées:');
      for (const tableName of studentTables) {
        console.log(`\n   Table: ${tableName}`);
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('   Colonnes:');
        columns.forEach(col => {
          console.log(`      - ${col.Field} (${col.Type})`);
        });
      }
    }

    // Chercher les tables de classes
    const classTables = tableNames.filter(name =>
      name.toLowerCase().includes('class') ||
      name.toLowerCase().includes('classe')
    );

    if (classTables.length > 0) {
      console.log('\n🏫 Tables de classes trouvées:');
      for (const tableName of classTables) {
        console.log(`\n   Table: ${tableName}`);
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('   Colonnes:');
        columns.forEach(col => {
          console.log(`      - ${col.Field} (${col.Type})`);
        });
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkDatabase();
