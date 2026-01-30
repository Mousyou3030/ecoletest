import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { gradeService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Grade {
  id: string;
  courseName: string;
  subject: string;
  grade: number;
  max: number;
  type: string;
  date: string;
  comment?: string;
}

const MyGrades: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await gradeService.getAll({ studentId: user?.id });
      setGrades(response);
    } catch (err) {
      console.error('Erreur lors du chargement des notes:', err);
      setError('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getGradeColor = (grade: number, max: number) => {
    const percentage = (grade / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAverageBySubject = () => {
    const subjectGrades: { [key: string]: number[] } = {};

    grades.forEach(grade => {
      if (!subjectGrades[grade.subject]) {
        subjectGrades[grade.subject] = [];
      }
      subjectGrades[grade.subject].push((grade.grade / grade.max) * 20);
    });

    return Object.entries(subjectGrades).map(([subject, gradesList]) => ({
      subject,
      average: (gradesList.reduce((a, b) => a + b, 0) / gradesList.length).toFixed(2),
      count: gradesList.length
    }));
  };

  const getOverallAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((acc, grade) => acc + (grade.grade / grade.max) * 20, 0);
    return (total / grades.length).toFixed(2);
  };

  const subjects = ['all', ...Array.from(new Set(grades.map(g => g.subject)))];
  const filteredGrades = selectedSubject === 'all'
    ? grades
    : grades.filter(g => g.subject === selectedSubject);

  const averagesBySubject = getAverageBySubject();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Notes</h1>
        <p className="text-gray-600">Consultez vos résultats et vos moyennes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Moyenne Générale</p>
              <p className="text-3xl font-bold">{getOverallAverage()}/20</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Star className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Total Notes</p>
              <p className="text-3xl font-bold">{grades.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-3" />
            <div>
              <p className="text-purple-100">Matières</p>
              <p className="text-3xl font-bold">{averagesBySubject.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Ce mois-ci</p>
              <p className="text-3xl font-bold">
                {grades.filter(g => {
                  const gradeDate = new Date(g.date);
                  const now = new Date();
                  return gradeDate.getMonth() === now.getMonth() && gradeDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par Matière</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {averagesBySubject.map(item => (
            <div key={item.subject} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.subject}</p>
                  <p className="text-sm text-gray-500">{item.count} note(s)</p>
                </div>
                <div className={`text-2xl font-bold ${
                  parseFloat(item.average) >= 16 ? 'text-green-600' :
                  parseFloat(item.average) >= 12 ? 'text-blue-600' :
                  parseFloat(item.average) >= 10 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {item.average}/20
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historique des Notes</h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Toutes les matières</option>
            {subjects.filter(s => s !== 'all').map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {filteredGrades.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune note disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Matière</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Note</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map(grade => (
                  <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(grade.date)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{grade.courseName}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{grade.subject}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {grade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-lg font-bold ${getGradeColor(grade.grade, grade.max)}`}>
                        {grade.grade}/{grade.max}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {grade.comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGrades;
