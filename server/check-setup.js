const mysql = require('mysql2/promise');
require('dotenv').config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function checkSetup() {
  console.log('\n' + colors.blue + '=== Vérification de la configuration MySchool ===' + colors.reset + '\n');

  let allGood = true;

  // 1. Vérifier les variables d'environnement
  console.log('1️⃣  Vérification des variables d\'environnement...');
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'myschool_db',
    port: process.env.DB_PORT || 3306
  };
  console.log(colors.green + '   ✓ Variables chargées' + colors.reset);
  console.log(`   - Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   - User: ${dbConfig.user}`);
  console.log(`   - Database: ${dbConfig.database}`);

  // 2. Tester la connexion MySQL
  console.log('\n2️⃣  Test de connexion à MySQL...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    console.log(colors.green + '   ✓ Connexion MySQL réussie' + colors.reset);
  } catch (error) {
    console.log(colors.red + '   ✗ Échec de connexion à MySQL' + colors.reset);
    console.log(colors.red + '   Erreur: ' + error.message + colors.reset);
    console.log('\n   💡 Solution: Assurez-vous que MySQL est démarré et que les credentials sont corrects dans server/.env');
    allGood = false;
    return;
  }

  // 3. Vérifier l'existence de la base de données
  console.log('\n3️⃣  Vérification de la base de données...');
  try {
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbConfig.database]);
    if (databases.length === 0) {
      console.log(colors.red + `   ✗ Base de données "${dbConfig.database}" introuvable` + colors.reset);
      console.log('\n   💡 Solution: Créez la base de données avec:');
      console.log(`   mysql -u root -p -e "CREATE DATABASE ${dbConfig.database}"`);
      allGood = false;
      await connection.end();
      return;
    }
    console.log(colors.green + `   ✓ Base de données "${dbConfig.database}" existe` + colors.reset);

    // Se connecter à la base de données
    await connection.changeUser({ database: dbConfig.database });
  } catch (error) {
    console.log(colors.red + '   ✗ Erreur lors de la vérification de la base de données' + colors.reset);
    console.log(colors.red + '   Erreur: ' + error.message + colors.reset);
    allGood = false;
    await connection.end();
    return;
  }

  // 4. Vérifier les tables
  console.log('\n4️⃣  Vérification des tables...');
  try {
    const [tables] = await connection.query('SHOW TABLES');
    const requiredTables = ['users', 'classes', 'courses', 'students_classes', 'grades', 'attendances'];
    const existingTables = tables.map(t => Object.values(t)[0]);

    let missingTables = [];
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(colors.green + `   ✓ Table "${table}" existe` + colors.reset);
      } else {
        console.log(colors.yellow + `   ⚠ Table "${table}" manquante` + colors.reset);
        missingTables.push(table);
      }
    });

    if (missingTables.length > 0) {
      console.log(colors.yellow + '\n   💡 Solution: Importez le schéma de la base de données:' + colors.reset);
      console.log(`   mysql -u root -p ${dbConfig.database} < server/database-schema.sql`);
      allGood = false;
    }
  } catch (error) {
    console.log(colors.red + '   ✗ Erreur lors de la vérification des tables' + colors.reset);
    console.log(colors.red + '   Erreur: ' + error.message + colors.reset);
    allGood = false;
  }

  // 5. Vérifier les données de test
  console.log('\n5️⃣  Vérification des données...');
  try {
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [classes] = await connection.query('SELECT COUNT(*) as count FROM classes');
    const [courses] = await connection.query('SELECT COUNT(*) as count FROM courses');
    const [studentClasses] = await connection.query('SELECT COUNT(*) as count FROM student_classes WHERE isActive = TRUE');

    console.log(`   - Utilisateurs: ${users[0].count}`);
    console.log(`   - Classes: ${classes[0].count}`);
    console.log(`   - Cours: ${courses[0].count}`);
    console.log(`   - Inscriptions d'élèves actives: ${studentClasses[0].count}`);

    if (users[0].count === 0) {
      console.log(colors.yellow + '\n   ⚠ Aucun utilisateur dans la base de données' + colors.reset);
      console.log('   💡 Le schéma devrait créer des utilisateurs de test automatiquement');
      allGood = false;
    }

    if (studentClasses[0].count === 0) {
      console.log(colors.yellow + '\n   ⚠ Aucun élève inscrit dans les classes' + colors.reset);
      console.log('   💡 Ceci explique pourquoi vous ne pouvez pas ajouter de notes');
      console.log('   💡 Utilisez l\'interface Admin pour ajouter des élèves aux classes');
    }
  } catch (error) {
    console.log(colors.red + '   ✗ Erreur lors de la vérification des données' + colors.reset);
    console.log(colors.red + '   Erreur: ' + error.message + colors.reset);
  }

  await connection.end();

  // Résumé
  console.log('\n' + colors.blue + '=== Résumé ===' + colors.reset);
  if (allGood) {
    console.log(colors.green + '\n✅ Configuration correcte! Vous pouvez démarrer le serveur avec: npm start' + colors.reset + '\n');
  } else {
    console.log(colors.red + '\n❌ Des problèmes ont été détectés. Veuillez les corriger avant de démarrer.' + colors.reset + '\n');
  }
}

checkSetup().catch(error => {
  console.error(colors.red + '\n❌ Erreur fatale:' + colors.reset, error.message);
  process.exit(1);
});
