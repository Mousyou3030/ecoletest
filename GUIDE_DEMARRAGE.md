# 🚀 Guide de Démarrage - MySchool avec votre base MySQL

## ✅ Configuration actuelle

Votre projet est maintenant configuré pour utiliser votre base de données MySQL existante :

- **Base de données** : `myscols`
- **Host** : `localhost`
- **Port** : `3306`
- **Utilisateur** : `root`

## 📋 Étapes de démarrage

### 1️⃣ Vérifier la structure de votre base de données

Sur **votre machine locale**, exécutez :

```bash
cd server
node check-structure.js
```

Ce script va :
- Se connecter à votre base `myscols`
- Lister toutes les tables existantes
- Afficher les colonnes de chaque table
- Compter le nombre de lignes dans chaque table

### 2️⃣ Importer les tables manquantes (si nécessaire)

Si votre base est vide ou manque certaines tables, importez le schéma :

```bash
# Option 1 : Via la ligne de commande
mysql -u root -pMous@2020 myscols < database-schema.sql

# Option 2 : Via MySQL Workbench ou phpMyAdmin
# - Ouvrez database-schema.sql
# - Copiez le contenu
# - Exécutez-le dans votre base myscols
```

Le fichier `database-schema.sql` contient :
- ✅ Toutes les tables nécessaires (users, classes, courses, etc.)
- ✅ Les index pour les performances
- ✅ Des données de test pour commencer

**Important** : Le script utilise `CREATE TABLE IF NOT EXISTS`, donc il ne supprimera pas vos tables existantes.

### 3️⃣ Démarrer le serveur backend

```bash
cd server
npm install   # Si pas encore fait
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

Vous devriez voir :
```
✅ Connexion à MySQL réussie
🚀 Serveur démarré sur le port 5000
```

### 4️⃣ Démarrer le frontend

Dans un **nouveau terminal**, à la racine du projet :

```bash
npm install   # Si pas encore fait
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

## 👥 Comptes de test

Si vous importez le schéma avec les données de test, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@school.com | password123 |
| Enseignant | teacher@school.com | password123 |
| Élève | student@school.com | password123 |
| Parent | parent@school.com | password123 |

## 🔍 Structure des tables requises

Votre base `myscols` doit contenir ces tables :

### Tables principales
- `users` - Utilisateurs (admin, enseignants, élèves, parents)
- `classes` - Classes scolaires
- `class_students` - Liaison élèves-classes
- `courses` - Cours et matières
- `schedules` - Emplois du temps
- `attendances` - Présences des élèves
- `grades` - Notes et évaluations
- `payments` - Paiements et factures
- `parent_children` - Liaison parents-enfants

### Format des colonnes (snake_case)

Le backend utilise le format **snake_case** pour les colonnes :
- ✅ `first_name`, `last_name`
- ✅ `teacher_id`, `student_id`
- ✅ `created_at`, `updated_at`

Si vos colonnes existantes utilisent **camelCase** (firstName, teacherId), vous avez 2 options :

**Option A** : Renommer les colonnes en snake_case (recommandé)
```sql
ALTER TABLE users CHANGE firstName first_name VARCHAR(100);
ALTER TABLE users CHANGE lastName last_name VARCHAR(100);
-- etc.
```

**Option B** : Adapter le code backend pour utiliser camelCase

## 🐛 Résolution de problèmes

### ❌ Erreur : ECONNREFUSED

**Problème** : MySQL n'est pas démarré

**Solution** :
```bash
# Windows (via XAMPP, WAMP, ou MySQL Workbench)
- Démarrez le service MySQL

# Linux/Mac
sudo systemctl start mysql
# ou
brew services start mysql
```

### ❌ Erreur : Access denied

**Problème** : Mauvais mot de passe ou utilisateur

**Solution** : Vérifiez le fichier `server/.env` :
```env
DB_USER=root
DB_PASSWORD=Mous@2020
```

### ❌ Erreur : Unknown database 'myscols'

**Problème** : La base n'existe pas

**Solution** :
```sql
CREATE DATABASE myscols CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ❌ Erreur : Table doesn't exist

**Problème** : Tables manquantes

**Solution** : Importez le schéma SQL
```bash
mysql -u root -pMous@2020 myscols < server/database-schema.sql
```

## 🔄 Flux de données

```
Frontend (React)
    ↓
    ↓ http://localhost:5000/api
    ↓
Backend (Express + JWT Auth)
    ↓
    ↓ MySQL queries
    ↓
Base MySQL (myscols)
```

## 📊 Tester la connexion

Une fois tout démarré, testez dans votre navigateur :

1. **Frontend** : http://localhost:5173
2. **Backend API** : http://localhost:5000/api/auth/verify
3. **Connexion** : Utilisez un des comptes de test

## ✨ Fonctionnalités connectées

Toutes ces données proviennent de votre base `myscols` :

- ✅ Dashboard Admin : statistiques en temps réel
- ✅ Dashboard Enseignant : classes, emploi du temps, présences
- ✅ Dashboard Élève : notes, moyennes, prochains cours
- ✅ Dashboard Parent : suivi des enfants
- ✅ Gestion des présences : enregistrement et statistiques
- ✅ Gestion des notes : calcul automatique des moyennes
- ✅ Gestion des classes : ajout/retrait d'élèves

## 🆘 Besoin d'aide ?

Si vous rencontrez un problème :

1. Vérifiez que MySQL est démarré
2. Exécutez `node server/check-structure.js` pour voir votre structure
3. Vérifiez les logs du serveur backend
4. Vérifiez la console du navigateur pour les erreurs frontend

---

**Prêt à démarrer ?** 🚀

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```
