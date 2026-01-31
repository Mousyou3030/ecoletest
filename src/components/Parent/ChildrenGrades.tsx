import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  comment: string;
}

const ChildrenGrades: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const childrenResponse = await axios.get(`${API_BASE_URL}/parent-children/parent/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(childrenResponse.data);

      const childIds = childrenResponse.data.map((c: Child) => c.id);
      const gradesPromises = childIds.map((childId: string) =>
        axios.get(`${API_BASE_URL}/grades/student/${childId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      const gradesResponses = await Promise.all(gradesPromises);
      const allGrades = gradesResponses.flatMap((response, index) =>
        response.data.map((grade: any) => ({
          ...grade,
          studentId: childIds[index],
          studentName: `${childrenResponse.data[index].firstName} ${childrenResponse.data[index].lastName}`
        }))
      );

      setGrades(allGrades);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = selectedChild === 'all'
    ? grades
    : grades.filter(g => g.studentId === selectedChild);

  const calculateAverage = (childId: string) => {
    const childGrades = grades.filter(g => g.studentId === childId);
    if (childGrades.length === 0) return 0;
    const sum = childGrades.reduce((acc, g) => acc + (g.grade / g.maxGrade) * 20, 0);
    return (sum / childGrades.length).toFixed(2);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes des Enfants</h1>
          <p className="text-gray-600">Suivi des résultats scolaires</p>
        </div>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les enfants</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>
              {child.firstName} {child.lastName}
            </option>
          ))}
        </select>
      </div>

      {children.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun enfant associé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {children.map(child => (
              <div key={child.id} className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 mr-2" />
                  <h3 className="font-semibold">{child.firstName}</h3>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Moyenne Générale</p>
                    <p className="text-3xl font-bold">{calculateAverage(child.id)}/20</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Élève</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Matière</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Note</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Aucune note disponible
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map(grade => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">{grade.studentName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{grade.subject}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            (grade.grade / grade.maxGrade) * 20 >= 16 ? 'bg-green-100 text-green-800' :
                            (grade.grade / grade.maxGrade) * 20 >= 12 ? 'bg-blue-100 text-blue-800' :
                            (grade.grade / grade.maxGrade) * 20 >= 10 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.grade}/{grade.maxGrade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(grade.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {grade.comment || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChildrenGrades;
