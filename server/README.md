# MySchool API Server

Serveur Express.js avec MySQL pour l'application de gestion scolaire MySchool.

## 🚀 Installation

### 1. Installer les dépendances
```bash
cd server
npm install
```

### 2. Configuration de la base de données MySQL

**Créer la base de données :**
```sql
CREATE DATABASE myschool_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Importer le schéma :**
```bash
mysql -u root -p myschool_db < database-schema.sql
```

Le fichier `database-schema.sql` créera automatiquement :
- Toutes les tables nécessaires
- Les index pour les performances
- Des données de test (4 utilisateurs, 1 classe, 1 cours, quelques notes et présences)

### 3. Variables d'environnement

Créer un fichier `.env` à la racine du dossier `server` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=myschool_db
DB_PORT=3306

JWT_SECRET=votre_clé_secrète_jwt_très_longue_et_sécurisée
PORT=5000
```

### 4. Démarrer le serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 👥 Comptes de test

Après l'import du schéma, vous pouvez vous connecter avec ces comptes (mot de passe : `password123`) :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@school.com | password123 |
| Enseignant | teacher@school.com | password123 |
| Élève | student@school.com | password123 |
| Parent | parent@school.com | password123 |

## 📚 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (admin seulement)
- `GET /api/auth/verify` - Vérification du token
- `POST /api/auth/logout` - Déconnexion

### Dashboard
- `GET /api/dashboard/admin-stats` - Statistiques admin
- `GET /api/dashboard/teacher/:teacherId` - Dashboard enseignant
- `GET /api/dashboard/student/:studentId` - Dashboard élève
- `GET /api/dashboard/parent/:parentId` - Dashboard parent

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (admin)
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur (admin)
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (admin)

### Classes
- `GET /api/classes` - Liste des classes
- `GET /api/classes/:id` - Détails d'une classe (inclut les élèves)
- `POST /api/classes` - Créer une classe (admin)
- `PUT /api/classes/:id` - Modifier une classe (admin)
- `DELETE /api/classes/:id` - Supprimer une classe (admin)
- `POST /api/classes/:id/students` - Ajouter un élève à une classe
- `DELETE /api/classes/:id/students/:studentId` - Retirer un élève

### Présences
- `GET /api/attendances` - Liste des présences (avec filtres)
- `GET /api/attendances/stats` - Statistiques de présence
- `POST /api/attendances` - Créer/Mettre à jour une présence
- `POST /api/attendances/bulk` - Enregistrement en masse des présences
- `PUT /api/attendances/:id` - Modifier une présence
- `DELETE /api/attendances/:id` - Supprimer une présence

### Cours
- `GET /api/courses` - Liste des cours
- `GET /api/courses/:id` - Détails d'un cours
- `POST /api/courses` - Créer un cours (admin)
- `PUT /api/courses/:id` - Modifier un cours (admin)
- `DELETE /api/courses/:id` - Supprimer un cours (admin)

### Notes
- `GET /api/grades` - Liste des notes
- `POST /api/grades` - Ajouter une note
- `PUT /api/grades/:id` - Modifier une note
- `DELETE /api/grades/:id` - Supprimer une note

### Emplois du temps
- `GET /api/schedules` - Liste des emplois du temps
- `POST /api/schedules` - Créer un emploi du temps
- `PUT /api/schedules/:id` - Modifier un emploi du temps
- `DELETE /api/schedules/:id` - Supprimer un emploi du temps

### Paiements
- `GET /api/payments` - Liste des paiements
- `POST /api/payments` - Créer un paiement
- `PUT /api/payments/:id` - Modifier un paiement

## 🔐 Authentification

L'API utilise JWT pour l'authentification. Inclure le token dans l'en-tête de chaque requête :
```
Authorization: Bearer <token>
```

## 🛠️ Structure de la base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (admin, enseignants, élèves, parents) |
| `classes` | Classes scolaires |
| `class_students` | Liaison élèves-classes |
| `courses` | Cours et matières |
| `schedules` | Emplois du temps |
| `attendances` | Présences des élèves |
| `grades` | Notes et évaluations |
| `payments` | Paiements et factures |
| `parent_children` | Liaison parents-enfants |

### Schéma SQL

Le schéma utilise la convention **snake_case** pour les noms de colonnes :
- `first_name`, `last_name` (pas firstName, lastName)
- `teacher_id`, `student_id` (pas teacherId, studentId)
- `created_at`, `updated_at` (pas createdAt, updatedAt)

Toutes les tables ont des index appropriés pour optimiser les performances.

## 🔧 Technologies utilisées

- **Express.js** - Framework web
- **MySQL2** - Base de données (avec pool de connexions)
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **Helmet** - Sécurité HTTP
- **CORS** - Gestion des origines croisées
- **express-validator** - Validation des données

## 📊 Flux de données

1. Le frontend React envoie les requêtes à `http://localhost:5000/api`
2. Le middleware d'authentification vérifie le token JWT
3. Les routes traitent la requête et interrogent MySQL
4. Les données sont renvoyées au format JSON

## 🐛 Dépannage

### Erreur de connexion à MySQL
- Vérifiez que MySQL est démarré
- Vérifiez les credentials dans `.env`
- Vérifiez que la base de données `myschool_db` existe

### Token invalide
- Assurez-vous que `JWT_SECRET` est défini dans `.env`
- Reconnectez-vous pour obtenir un nouveau token

### Données de test manquantes
- Réexécutez le fichier `database-schema.sql` pour recréer les données de test
