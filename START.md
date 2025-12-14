# Démarrage rapide - MySchool

## Étapes simples pour démarrer l'application

### 1. Configuration MySQL (première fois seulement)

Assurez-vous d'avoir MySQL installé et en cours d'exécution.

Créez la base de données :
```bash
mysql -u root -p
CREATE DATABASE myschool_db;
EXIT;
```

Importez le schéma :
```bash
mysql -u root -p myschool_db < server/database-schema.sql
```

### 2. Configuration (première fois seulement)

Modifiez `server/.env` avec votre mot de passe MySQL :
```env
DB_PASSWORD=votre_mot_de_passe_mysql
```

### 3. Démarrage quotidien

**Terminal 1 - Backend :**
```bash
cd server
npm start
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### 4. Accès à l'application

Ouvrez votre navigateur : `http://localhost:5173`

**Comptes de test :**
- Admin : `admin@school.com` / `password123`
- Enseignant : `teacher@school.com` / `password123`
- Étudiant : `student@school.com` / `password123`
- Parent : `parent@school.com` / `password123`

---

Pour plus de détails, consultez [INSTALLATION.md](INSTALLATION.md)
