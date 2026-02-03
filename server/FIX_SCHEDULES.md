# Correction de la table schedules

## Problème
La table `schedules` avait des types de colonnes incorrects :
- `id` : VARCHAR(36) au lieu de INT
- `teacherId` : VARCHAR(36) au lieu de INT
- `classId` : VARCHAR(36) au lieu de INT

Cela empêchait les plannings créés par l'admin de s'afficher dans l'interface enseignant.

## Solution
Exécuter le script de migration pour corriger les types de colonnes.

## Instructions

### Option 1 : Script automatique (Recommandé)
```bash
cd server
node fix-schedules.js
```

### Option 2 : Exécution manuelle SQL
```bash
cd server
mysql -u votre_utilisateur -p votre_base_de_donnees < fix-schedules-types.sql
```

## Vérification
Après l'exécution, vérifiez que :
1. La table `schedules` existe
2. Les colonnes `id`, `teacherId` et `classId` sont de type INT
3. Les contraintes de clés étrangères sont en place
4. Les plannings existants sont toujours présents

## Note importante
⚠️ Cette migration modifie la structure de la table. Si vous avez déjà des données dans la table `schedules` avec des IDs de type VARCHAR, elles pourraient être affectées. Il est recommandé de faire une sauvegarde avant d'exécuter cette migration.

## Après la migration
Une fois la migration exécutée :
1. Redémarrez le serveur backend
2. Connectez-vous en tant qu'enseignant
3. Accédez à l'onglet "Mon Planning"
4. Vous devriez voir les plannings créés par l'administrateur
