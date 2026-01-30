import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Course {
  id: string;
  name: string;
  subject: string;
  description: string;
  teacherName: string;
  className: string;
  schedule?: string;
}

const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAll({ studentId: user?.id });
      setCourses(response);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
      setError('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
        <p className="text-gray-600">Consultez la liste de vos cours</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun cours disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.subject}</p>
                </div>
              </div>

              {course.description && (
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{course.teacherName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{course.className}</span>
                </div>
                {course.schedule && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.schedule}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
