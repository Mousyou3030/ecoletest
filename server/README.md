# MySchool API Server

Serveur Express.js avec MySQL pour l'application de gestion scolaire MySchool.

## 🚀 Installation

1. **Installer les dépendances**
```bash
cd server
npm install
```

2. **Configuration de la base de données**
- Créer une base de données MySQL nommée `myschool_db`
- Importer le fichier `config/createTables.sql` dans votre base de données
- Configurer les variables d'environnement dans `.env`

3. **Variables d'environnement**
Copier `.env.example` vers `.env` et configurer :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=myschool_db
JWT_SECRET=votre_clé_secrète_jwt
```

4. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 📚 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (admin seulement)
- `GET /api/auth/verify` - Vérification du token
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (admin)
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur (admin)
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (admin)

### Classes
- `GET /api/classes` - Liste des classes
- `GET /api/classes/:id` - Détails d'une classe
- `POST /api/classes` - Créer une classe (admin)
- `PUT /api/classes/:id` - Modifier une classe (admin)
- `DELETE /api/classes/:id` - Supprimer une classe (admin)
- `POST /api/classes/:id/students` - Ajouter un élève à une classe
- `DELETE /api/classes/:id/students/:studentId` - Retirer un élève

## 🔐 Authentification

L'API utilise JWT pour l'authentification. Inclure le token dans l'en-tête :
```
Authorization: Bearer <token>
```

## 👥 Comptes de test

- **Admin**: admin@school.edu / password
- **Enseignant**: teacher@school.edu / password  
- **Élève**: student@school.edu / password
- **Parent**: parent@school.edu / password

## 🛠️ Structure de la base de données

- `users` - Utilisateurs (admin, enseignants, élèves, parents)
- `classes` - Classes scolaires
- `student_classes` - Liaison élèves-classes
- `parent_children` - Liaison parents-enfants
- `courses` - Cours et matières
- `schedules` - Emplois du temps
- `grades` - Notes et évaluations
- `attendances` - Présences
- `messages` - Messagerie
- `payments` - Paiements
- `notifications` - Notifications

## 🔧 Développement

Le serveur utilise :
- **Express.js** - Framework web
- **MySQL2** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **Helmet** - Sécurité
- **CORS** - Gestion des origines croisées