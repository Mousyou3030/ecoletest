import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface TeacherData {
  teacher: {
    firstName: string;
    lastName: string;
  };
  myClasses: number;
  coursesThisWeek: number;
  totalStudents: number;
  attendanceRate: number;
  todaySchedule: Array<{
    time: string;
    subject: string;
    class: string;
    room: string;
  }>;
  upcomingTasks: Array<{
    task: string;
    deadline: string;
    priority: string;
  }>;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const dashboardData = await dashboardService.getTeacherDashboard(user.id);
        setData(dashboardData);
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div className="text-gray-600">Aucune donnée disponible</div>;

  const todaySchedule = data.todaySchedule;

  const upcomingTasks = data.upcomingTasks;

  const stats = [
    { title: 'Mes Classes', value: data.myClasses.toString(), icon: Users, color: 'blue' },
    { title: 'Cours Cette Semaine', value: data.coursesThisWeek.toString(), icon: BookOpen, color: 'green' },
    { title: 'Élèves Total', value: data.totalStudents.toString(), icon: Users, color: 'purple' },
    { title: 'Taux Présence', value: `${data.attendanceRate}%`, icon: CheckCircle, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Enseignant</h1>
        <p className="text-gray-600">Bonjour Prof. {data.teacher.lastName}, voici votre planning du jour</p>
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