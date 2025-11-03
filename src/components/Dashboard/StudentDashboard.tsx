import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, TrendingUp, Clock, Star, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface StudentData {
  student: {
    firstName: string;
    lastName: string;
  };
  averageGrade: number;
  attendance: number;
  completedAssignments: number;
  classRank: number;
  nextClasses: Array<{
    startTime: string;
    subject: string;
    teacher: string;
    room: string;
  }>;
  recentGrades: Array<{
    subject: string;
    grade: number;
    max: number;
    date: string;
  }>;
  assignments: Array<{
    subject: string;
    title: string;
    due: string;
    urgent: boolean;
  }>;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const dashboardData = await dashboardService.getStudentDashboard(user.id);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const nextClasses = data.nextClasses.map(cls => ({
    time: new Date(cls.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    subject: cls.subject,
    teacher: cls.teacher,
    room: cls.room
  }));

  const recentGrades = data.recentGrades.map(grade => ({
    ...grade,
    date: formatDate(grade.date)
  }));

  const assignments = data.assignments;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Élève</h1>
        <p className="text-gray-600">Bonjour {data.student.firstName}, voici ton résumé de la journée</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Moyenne Générale</p>
              <p className="text-2xl font-bold">{data.averageGrade}/20</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Présences</p>
              <p className="text-2xl font-bold">{data.attendance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-3" />
            <div>
              <p className="text-purple-100">Devoirs Remis</p>
              <p className="text-2xl font-bold">{data.completedAssignments}/15</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Award className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Rang Classe</p>
              <p className="text-2xl font-bold">{data.classRank}ème</p>
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