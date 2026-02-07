# Guide: Ajouter des notes dans l'interface enseignant

## Prérequis

Pour ajouter des notes, vous devez **obligatoirement** :

1. ✅ **Serveur backend démarré** sur le port 5000
2. ✅ **MySQL en cours d'exécution** avec la base de données créée
3. ✅ **Des élèves inscrits** dans la classe du cours

## Démarrage rapide

### Étape 1 : Vérifier la configuration

```bash
cd server
npm run check
```

Ce script vérifie automatiquement :
- La connexion MySQL
- L'existence de la base de données
- Les tables nécessaires
- Les données de test

### Étape 2 : Démarrer les serveurs

**Terminal 1 - Backend :**
```bash
cd server
npm install  # Première fois seulement
npm start
```

Attendez de voir : `✅ Connexion à MySQL réussie`

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### Étape 3 : Se connecter en tant qu'enseignant

Ouvrez `http://localhost:5173` et connectez-vous :
- **Email :** `teacher@school.com`
- **Mot de passe :** `password123`

### Étape 4 : Ajouter des élèves à une classe (si nécessaire)

Si vous voyez "Aucun élève inscrit dans ce cours" :

1. Connectez-vous en tant qu'**Admin** (`admin@school.com` / `password123`)
2. Allez dans **"Gestion des Classes"**
3. Sélectionnez une classe
4. Cliquez sur **"Gérer les étudiants"**
5. Ajoutez des élèves à la classe

### Étape 5 : Ajouter une note

1. Retournez dans le compte **Enseignant**
2. Allez dans **"Notes"**
3. Sélectionnez un **cours** dans le menu déroulant
4. Cliquez sur **"Nouvelle note"**
5. Sélectionnez un **élève** (ils devraient maintenant apparaître)
6. Remplissez la note, le type, la date
7. Cliquez sur **"Ajouter la note"**

## Résolution des problèmes

### Problème : "Chargement des élèves..."

**Cause :** Le serveur backend ne répond pas.

**Solution :**
```bash
# Vérifiez que le serveur est démarré
cd server
npm start
```

### Problème : "Aucun élève inscrit dans ce cours"

**Cause :** Aucun élève n'est inscrit dans la classe liée au cours.

**Solution :**
1. Connectez-vous en tant qu'Admin
2. Allez dans "Gestion des Classes"
3. Ajoutez des élèves à la classe du cours

Vous pouvez vérifier dans MySQL :
```sql
USE myschool_db;

-- Voir les cours et leurs classes
SELECT c.name as cours, cl.name as classe
FROM courses c
JOIN classes cl ON c.classId = cl.id;

-- Voir les élèves inscrits dans chaque classe
SELECT
    cl.name as classe,
    u.firstName,
    u.lastName,
    sc.isActive
FROM student_classes sc
JOIN classes cl ON sc.classId = cl.id
JOIN users u ON sc.studentId = u.id
WHERE sc.isActive = TRUE;
```

### Problème : "Erreur de connexion"

**Cause :** Le serveur backend n'est pas accessible.

**Solutions :**
1. Vérifiez que le serveur écoute sur le port 5000
2. Vérifiez `.env` : `VITE_API_URL=http://localhost:5000/api`
3. Désactivez temporairement le pare-feu

### Problème : Le serveur ne démarre pas

**Cause :** MySQL n'est pas configuré.

**Solution :**
```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE myschool_db;"

# Importer le schéma
mysql -u root -p myschool_db < server/database-schema.sql

# Configurer le mot de passe dans server/.env
echo "DB_PASSWORD=votre_mot_de_passe" > server/.env
```

## Vérification finale

Console du navigateur (F12) :
- ✅ Aucune erreur rouge
- ✅ Requête vers `/api/teacher/courses/[id]/students` réussie
- ✅ Réponse contenant une liste d'élèves

Terminal du serveur :
- ✅ `✅ Connexion à MySQL réussie`
- ✅ `Serveur démarré sur le port 5000`
- ✅ Requêtes GET reçues sans erreur

## Flux complet de données

```
Frontend                    Backend                     Database
--------                    -------                     --------
1. Sélectionne un cours
2. GET /teacher/courses/:id/students
                            3. Vérifie l'autorisation
                            4. Requête SQL:
                               SELECT users
                               FROM student_classes
                               WHERE classId = courseId
                                                            5. Retourne les élèves
                            6. Renvoie JSON
7. Affiche les élèves
8. Remplit le formulaire
9. POST /grades
                            10. Crée la note
                                                            11. INSERT INTO grades
                            12. Confirme la création
13. Actualise la liste
```

## Support

Si le problème persiste après avoir suivi ce guide :

1. Exécutez `npm run check` dans le dossier `server`
2. Vérifiez les logs du serveur backend
3. Ouvrez la console du navigateur (F12) et copiez les erreurs
4. Vérifiez que des élèves sont bien inscrits dans la classe
