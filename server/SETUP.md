# Guide de Configuration du Serveur MySQL

## Étapes pour démarrer

### 1. Créer les tables dans votre base MySQL

Si les tables n'existent pas encore dans votre base `myscols`, exécutez le script SQL fourni :

```bash
mysql -u root -p myscols < database-schema.sql
```

Ou connectez-vous à MySQL et copiez-collez le contenu de `database-schema.sql`.

### 2. Vérifier votre base de données

Pour voir quelles tables existent dans votre base :

```bash
cd server
npm install
node check-db.js
```

Ce script affichera toutes les tables et leurs colonnes.

### 3. Démarrer le serveur Express

```bash
cd server
npm install
node server.js
```

Le serveur démarrera sur http://localhost:5000

### 4. Démarrer l'application React

Dans un autre terminal :

```bash
npm install
npm run dev
```

L'application démarrera sur http://localhost:5173

## Structure des Tables

### Table `users`
Contient tous les utilisateurs (admin, teachers, students, parents)
- id, email, password, first_name, last_name, role, etc.

### Table `classes`
Contient les classes
- id, name, level, academic_year, teacher_id, etc.

### Table `class_students`
Relation entre classes et étudiants
- id, class_id, student_id, enrollment_date, etc.

### Table `attendances`
Contient les présences
- id, student_id, class_id, date, status, notes, etc.
- status peut être: 'present', 'absent', 'late', 'excused'

## API Endpoints pour les Présences

### GET /api/attendances
Récupérer les présences avec filtres
- Query params: `class_id`, `date`, `status`, `student_id`

### GET /api/attendances/stats
Récupérer les statistiques de présence
- Query params: `class_id`, `date`, `start_date`, `end_date`

### POST /api/attendances
Créer ou mettre à jour une présence
- Body: `{ student_id, class_id, date, status, notes }`

### PUT /api/attendances/:id
Mettre à jour une présence
- Body: `{ status, notes }`

### POST /api/attendances/bulk
Enregistrer plusieurs présences en une fois
- Body: `{ class_id, date, attendances: [...] }`

### DELETE /api/attendances/:id
Supprimer une présence

## Adapter à votre structure existante

Si vos tables ont des noms ou colonnes différents, modifiez les requêtes SQL dans :
- `server/routes/attendances.js`

Par exemple, si votre table s'appelle `presences` au lieu de `attendances`, remplacez `attendances` par `presences` dans toutes les requêtes.

## Troubleshooting

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `server/.env`
- Vérifiez que la base `myscols` existe

### Erreur 401 (Unauthorized)
- Vérifiez que vous êtes connecté
- Le token JWT doit être valide

### Pas de données affichées
- Vérifiez que vous avez des données dans votre base
- Vérifiez les filtres (classe, date, statut)
- Ouvrez la console du navigateur pour voir les erreurs
