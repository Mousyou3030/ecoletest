# Guide d'installation - MySchool Management System

## Prérequis

- Node.js (v16 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

## Installation

### 1. Installation de MySQL

Si vous n'avez pas MySQL installé :

**Windows:**
- Téléchargez MySQL depuis [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Installez et notez votre mot de passe root

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### 2. Créer la base de données

Connectez-vous à MySQL :
```bash
mysql -u root -p
```

Créez la base de données :
```sql
CREATE DATABASE myschool_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Importer le schéma

Depuis le dossier du projet :
```bash
mysql -u root -p myschool_db < server/database-schema.sql
```

### 4. Configuration du serveur backend

Naviguez dans le dossier serveur :
```bash
cd server
```

Installez les dépendances :
```bash
npm install
```

Configurez le fichier `.env` (déjà créé, modifiez si nécessaire) :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=myschool_db

JWT_SECRET=changez_cette_valeur_en_production
JWT_EXPIRES_IN=24h
```

### 5. Configuration du frontend

Retournez à la racine du projet :
```bash
cd ..
```

Installez les dépendances :
```bash
npm install
```

Le fichier `.env` est déjà configuré pour pointer vers l'API Express.

## Démarrage de l'application

### 1. Démarrer le serveur backend

Dans un terminal, depuis le dossier `server/` :
```bash
npm start
```

Ou en mode développement avec rechargement automatique :
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### 2. Démarrer le frontend

Dans un autre terminal, depuis la racine du projet :
```bash
npm run dev
```

L'application démarre sur `http://localhost:5173`

## Comptes de test

Le schéma inclut des comptes de test (mot de passe : `password123`) :

- **Admin** : admin@school.com
- **Enseignant** : teacher@school.com
- **Étudiant** : student@school.com
- **Parent** : parent@school.com

## Vérification de l'installation

1. Ouvrez `http://localhost:5173` dans votre navigateur
2. Connectez-vous avec un des comptes de test
3. Vous devriez voir le tableau de bord correspondant à votre rôle

## Structure du projet

```
myschool/
├── server/                 # Backend Express + MySQL
│   ├── config/            # Configuration DB
│   ├── routes/            # Routes API
│   ├── middleware/        # Middleware d'authentification
│   └── database-schema.sql # Schéma de la base de données
├── src/                   # Frontend React
│   ├── components/        # Composants React
│   ├── contexts/          # Context API (Auth)
│   └── services/          # Services API
└── .env                   # Variables d'environnement
```

## Dépannage

### Erreur de connexion MySQL

Vérifiez que :
- MySQL est démarré : `mysql.server status` (Mac) ou `systemctl status mysql` (Linux)
- Les identifiants dans `server/.env` sont corrects
- La base de données `myschool_db` existe

### Port déjà utilisé

Si le port 5000 ou 5173 est déjà utilisé, modifiez :
- Backend : `PORT=5001` dans `server/.env`
- Frontend : `VITE_API_URL=http://localhost:5001/api` dans `.env`

### Problèmes d'authentification

Vérifiez que :
- Le JWT_SECRET est défini dans `server/.env`
- Le serveur backend est bien démarré
- Les tokens ne sont pas expirés (effacez le localStorage du navigateur)
