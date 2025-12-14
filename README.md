# MySchool - Système de Gestion Scolaire

Application web complète de gestion scolaire avec backend Express + MySQL et frontend React + TypeScript.

## Fonctionnalités

### Pour les Administrateurs
- Gestion complète des utilisateurs (enseignants, étudiants, parents)
- Gestion des classes et des cours
- Configuration des emplois du temps
- Suivi des présences et des notes
- Gestion financière (paiements, frais de scolarité)
- Messagerie et notifications
- Rapports et statistiques

### Pour les Enseignants
- Gestion de leurs classes et cours
- Saisie des notes et présences
- Communication avec étudiants et parents
- Consultation de l'emploi du temps
- Génération de rapports

### Pour les Étudiants
- Consultation des notes
- Visualisation de l'emploi du temps
- Suivi des présences
- Messagerie avec enseignants
- Notifications

### Pour les Parents
- Suivi de la progression des enfants
- Consultation des notes et présences
- Communication avec enseignants
- Gestion des paiements

## Technologies

**Backend :**
- Express.js
- MySQL
- JWT Authentication
- bcryptjs

**Frontend :**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Démarrage rapide

### Prérequis
- Node.js v16+
- MySQL 5.7+

### Installation

1. **Cloner et installer les dépendances :**
```bash
npm install
cd server && npm install
```

2. **Créer la base de données :**
```bash
mysql -u root -p
CREATE DATABASE myschool_db;
EXIT;
mysql -u root -p myschool_db < server/database-schema.sql
```

3. **Configurer l'environnement :**
Modifiez `server/.env` avec votre mot de passe MySQL.

4. **Démarrer l'application :**

Terminal 1 (Backend) :
```bash
cd server
npm start
```

Terminal 2 (Frontend) :
```bash
npm run dev
```

5. **Accéder à l'application :**
Ouvrez `http://localhost:5173`

**Comptes de test** (mot de passe: `password123`) :
- Admin : `admin@school.com`
- Enseignant : `teacher@school.com`
- Étudiant : `student@school.com`
- Parent : `parent@school.com`

## Documentation

- [START.md](START.md) - Guide de démarrage rapide
- [INSTALLATION.md](INSTALLATION.md) - Guide d'installation détaillé
- [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) - Architecture et technologies

## Structure du projet

```
myschool/
├── server/          # Backend Express + MySQL
│   ├── config/      # Configuration
│   ├── routes/      # Routes API
│   └── middleware/  # Middleware
├── src/             # Frontend React
│   ├── components/  # Composants
│   ├── services/    # Services API
│   └── contexts/    # Context API
└── docs/            # Documentation
```

## Licence

MIT
