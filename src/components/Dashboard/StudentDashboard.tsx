import React from 'react';
import { BookOpen, Calendar, TrendingUp, Clock, Star, Award } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const nextClasses = [
    { time: '10:00', subject: 'Mathématiques', teacher: 'M. Martin', room: 'Salle 101' },
    { time: '14:00', subject: 'Histoire', teacher: 'Mme Dubois', room: 'Salle 205' },
    { time: '16:00', subject: 'Anglais', teacher: 'M. Smith', room: 'Salle 301' }
  ];

  const recentGrades = [
    { subject: 'Mathématiques', grade: 16, max: 20, date: '15/01' },
    { subject: 'Français', grade: 14, max: 20, date: '14/01' },
    { subject: 'Histoire', grade: 18, max: 20, date: '12/01' },
    { subject: 'Anglais', grade: 15, max: 20, date: '10/01' }
  ];

  const assignments = [
    { subject: 'Mathématiques', title: 'Exercices Algèbre', due: 'Demain', urgent: true },
    { subject: 'Français', title: 'Dissertation', due: '2 jours', urgent: false },
    { subject: 'Histoire', title: 'Recherches WWI', due: '5 jours', urgent: false }
  ];

  const averageGrade = recentGrades.reduce((acc, grade) => acc + grade.grade, 0) / recentGrades.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Élève</h1>
        <p className="text-gray-600">Bonjour Sophie, voici ton résumé de la journée</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Moyenne Générale</p>
              <p className="text-2xl font-bold">{averageGrade.toFixed(1)}/20</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Présences</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-3" />
            <div>
              <p className="text-purple-100">Devoirs Remis</p>
              <p className="text-2xl font-bold">12/15</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Award className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Rang Classe</p>
              <p className="text-2xl font-bold">3ème</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Classes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Prochains Cours</h3>
          </div>
          <div className="space-y-4">
            {nextClasses.map((classItem, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-sm font-medium text-gray-900">{classItem.time}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{classItem.subject}</p>
                  <p className="text-sm text-gray-500">{classItem.teacher} - {classItem.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notes Récentes</h3>
          </div>
          <div className="space-y-4">
            {recentGrades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{grade.subject}</p>
                  <p className="text-sm text-gray-500">{grade.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${
                    grade.grade >= 16 ? 'text-green-600' :
                    grade.grade >= 12 ? 'text-blue-600' :
                    grade.grade >= 10 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {grade.grade}
                  </span>
                  <span className="text-gray-400">/{grade.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Devoirs à Rendre</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assignments.map((assignment, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${
              assignment.urgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  assignment.urgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {assignment.subject}
                </span>
                {assignment.urgent && (
                  <span className="text-xs text-red-600 font-medium">URGENT</span>
                )}
              </div>
              <h4 className="font-medium text-gray-900">{assignment.title}</h4>
              <p className="text-sm text-gray-500 mt-1">À rendre dans {assignment.due}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;