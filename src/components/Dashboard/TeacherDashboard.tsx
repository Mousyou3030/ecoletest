import React from 'react';
import { Calendar, Users, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const todaySchedule = [
    { time: '08:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 101' },
    { time: '10:00', subject: 'Mathématiques', class: '6ème B', room: 'Salle 101' },
    { time: '14:00', subject: 'Algèbre', class: '3ème A', room: 'Salle 203' },
    { time: '16:00', subject: 'Géométrie', class: '3ème B', room: 'Salle 203' }
  ];

  const upcomingTasks = [
    { task: 'Correction copies 6ème A', deadline: 'Demain', priority: 'high' },
    { task: 'Préparation cours Algèbre', deadline: '2 jours', priority: 'medium' },
    { task: 'Réunion parents d\'élèves', deadline: '3 jours', priority: 'high' },
    { task: 'Notes trimestre à saisir', deadline: '1 semaine', priority: 'low' }
  ];

  const stats = [
    { title: 'Mes Classes', value: '5', icon: Users, color: 'blue' },
    { title: 'Cours Cette Semaine', value: '18', icon: BookOpen, color: 'green' },
    { title: 'Élèves Total', value: '142', icon: Users, color: 'purple' },
    { title: 'Taux Présence', value: '92%', icon: CheckCircle, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Enseignant</h1>
        <p className="text-gray-600">Bonjour Prof. Martin, voici votre planning du jour</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${{
                  blue: 'bg-blue-100',
                  green: 'bg-green-100',
                  purple: 'bg-purple-100',
                  orange: 'bg-orange-100'
                }[stat.color]}`}>
                  <Icon className={`h-6 w-6 ${{
                    blue: 'text-blue-600',
                    green: 'text-green-600',
                    purple: 'text-purple-600',
                    orange: 'text-orange-600'
                  }[stat.color]}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Planning d'Aujourd'hui</h3>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.subject}</p>
                    <p className="text-sm text-gray-500">{item.class} - {item.room}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tâches à Faire</h3>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{task.task}</p>
                    <p className="text-sm text-gray-500">Échéance: {task.deadline}</p>
                  </div>
                </div>
                {task.priority === 'high' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Présences</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Notes</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Planning</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-8 w-8 text-orange-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Mes Classes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;