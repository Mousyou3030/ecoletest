# API Endpoints pour l'Enseignant

Ce document décrit tous les endpoints disponibles pour alimenter les onglets de l'espace enseignant avec de vraies données de votre base MySQL.

## Dashboard Enseignant

### GET `/api/dashboard/teacher/:teacherId`
Récupère les statistiques générales de l'enseignant.

**Réponse:**
```json
{
  "teacher": { "firstName": "...", "lastName": "..." },
  "myClasses": 3,
  "coursesThisWeek": 12,
  "totalStudents": 75,
  "attendanceRate": 92,
  "todaySchedule": [...],
  "upcomingTasks": [...]
}
```

## Mes Classes

### GET `/api/teacher/classes/:teacherId`
Récupère toutes les classes de l'enseignant avec leurs statistiques.

**Réponse:**
```json
[
  {
    "id": "1",
    "name": "6ème A",
    "level": "6ème",
    "studentCount": 28,
    "averageGrade": "14.2",
    "attendanceRate": 95,
    "nextLesson": {
      "dayOfWeek": 2,
      "time": "10:00",
      "topic": "Équations"
    }
  }
]
```

### GET `/api/teacher/classes/:teacherId/:classId/students`
Récupère la liste des étudiants d'une classe spécifique.

**Réponse:**
```json
[
  {
    "id": "1",
    "name": "Sophie Dupont",
    "firstName": "Sophie",
    "lastName": "Dupont",
    "lastGrade": 16,
    "attendance": 98,
    "behavior": "excellent"
  }
]
```

## Mes Cours

### GET `/api/teacher/courses/:teacherId`
Récupère tous les cours de l'enseignant.

**Réponse:**
```json
[
  {
    "id": "1",
    "title": "Algèbre - Équations",
    "description": "Introduction aux équations linéaires",
    "subject": "Mathématiques",
    "teacherId": "2",
    "classId": "1",
    "className": "6ème A",
    "gradeCount": 45,
    "sessionCount": 12
  }
]
```

## Mon Planning

### GET `/api/teacher/schedules/:teacherId`
Récupère l'emploi du temps complet de l'enseignant organisé par jour.

**Réponse:**
```json
{
  "Lundi": [
    {
      "id": "1",
      "time": "08:00 - 09:00",
      "subject": "Mathématiques",
      "class": "6ème A",
      "room": "Salle 101",
      "classId": "1"
    }
  ],
  "Mardi": [...]
}
```

## Notes

### GET `/api/teacher/grades/:teacherId?courseId=&classId=`
Récupère toutes les notes des étudiants dans les cours de l'enseignant.

**Paramètres optionnels:**
- `courseId`: Filtrer par cours spécifique
- `classId`: Filtrer par classe spécifique

**Réponse:**
```json
[
  {
    "id": "1",
    "grade": 16,
    "maxGrade": 20,
    "examType": "Contrôle",
    "comments": "Très bon travail",
    "createdAt": "2024-03-15T10:00:00",
    "studentName": "Sophie Dupont",
    "studentId": "1",
    "courseName": "Algèbre",
    "courseId": "1",
    "className": "6ème A"
  }
]
```

## Présences

### GET `/api/teacher/attendances/:teacherId?classId=&date=`
Récupère les présences des étudiants dans les classes de l'enseignant.

**Paramètres optionnels:**
- `classId`: Filtrer par classe spécifique
- `date`: Filtrer par date spécifique (format: YYYY-MM-DD)

Par défaut, retourne les présences des 7 derniers jours.

**Réponse:**
```json
[
  {
    "id": "1",
    "date": "2024-03-15",
    "status": "present",
    "notes": "En retard de 5 minutes",
    "studentName": "Sophie Dupont",
    "studentId": "1",
    "className": "6ème A",
    "classId": "1"
  }
]
```

## Utilisation dans les Composants React

### Exemple pour Mes Classes

```typescript
import { useEffect, useState } from 'react';
import api from '../../services/api';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const teacherId = 'votre-teacher-id'; // depuis le contexte auth

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get(`/teacher/classes/${teacherId}`);
        setClasses(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchClasses();
  }, [teacherId]);

  return (
    <div>
      {classes.map(cls => (
        <div key={cls.id}>
          <h3>{cls.name}</h3>
          <p>Étudiants: {cls.studentCount}</p>
          <p>Moyenne: {cls.averageGrade}/20</p>
          <p>Présence: {cls.attendanceRate}%</p>
        </div>
      ))}
    </div>
  );
};
```

### Exemple pour Mon Planning

```typescript
const MySchedule = () => {
  const [schedule, setSchedule] = useState({});
  const teacherId = 'votre-teacher-id';

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get(`/teacher/schedules/${teacherId}`);
        setSchedule(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchSchedule();
  }, [teacherId]);

  return (
    <div>
      {Object.entries(schedule).map(([day, classes]) => (
        <div key={day}>
          <h3>{day}</h3>
          {classes.map(cls => (
            <div key={cls.id}>
              <p>{cls.time} - {cls.subject} ({cls.class})</p>
              <p>Salle: {cls.room}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## Notes Importantes

1. **Authentification**: Tous les endpoints nécessitent un token JWT valide
2. **ID Enseignant**: Récupérez l'ID depuis `AuthContext.user.id`
3. **Format des dates**: Utilisez le format ISO (YYYY-MM-DD) pour les dates
4. **Nomenclature MySQL**: Toutes les requêtes utilisent le format `snake_case` (first_name, teacher_id, etc.) conformément au schéma de votre base de données

## Dépannage

Si vous rencontrez des erreurs :

1. Vérifiez que votre serveur MySQL est démarré
2. Vérifiez que votre base de données utilise le schéma fourni dans `server/database-schema.sql`
3. Assurez-vous que les colonnes suivent la nomenclature `snake_case` (first_name, teacher_id, class_id, etc.)
4. Consultez les logs du serveur pour plus de détails sur les erreurs
5. Vérifiez que les variables d'environnement dans `.env` sont correctement configurées
