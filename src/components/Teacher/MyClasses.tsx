import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const MyClasses: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedClass && user?.id) {
      fetchStudents();
    }
  }, [selectedClass, user?.id]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getClasses(user!.id);
      setMyClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des classes:', err);
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setError('');
      const data = await teacherService.getStudentsByClass(user!.id, selectedClass);
      console.log('Students loaded for class:', selectedClass, data);
      setStudents(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des élèves:', err);
      console.error('Error details:', err.response?.data);
      if (err.code === 'ERR_NETWORK') {
        setError('Erreur de connexion: Assurez-vous que le serveur backend est en cours d\'exécution');
      } else {
        setError(`Erreur: ${err.response?.data?.error || err.message}`);
      }
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (myClasses.length === 0) return <div className="text-gray-600">Aucune classe assignée</div>;

  const selectedClassData = myClasses.find(cls => cls.id === selectedClass);

  const getBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Classes</h1>
        <p className="text-gray-600">Gérez vos classes et suivez les progrès de vos élèves</p>
      </div>

      {/* Class Selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {myClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedClass === cls.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cls.name} {cls.level ? `- ${cls.level}` : ''}
            </button>
          ))}
        </div>
      </div>

      {selectedClassData && (
        <>
          {/* Class Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Élèves</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedClassData.studentCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedClassData.averageGrade}/20</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Présence</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedClassData.attendanceRate}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Prochain cours</p>
                  {selectedClassData.nextLesson ? (
                    <>
                      <p className="text-sm font-bold text-gray-900">{selectedClassData.nextLesson.day}</p>
                      <p className="text-xs text-gray-500">{selectedClassData.nextLesson.time}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">Non planifié</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next Lesson Info */}
          {selectedClassData.nextLesson && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Prochain cours: {selectedClassData.name}</h3>
                  <p className="text-blue-700">{selectedClassData.nextLesson.topic}</p>
                  <p className="text-sm text-blue-600">
                    {selectedClassData.nextLesson.day} à {selectedClassData.nextLesson.time}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Préparer le cours
                  </button>
                  <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Voir planning
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Élèves de {selectedClassData.name}
                </h3>
                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                    <FileText className="h-4 w-4 mr-1" />
                    Présences
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Notes
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Messages
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-b border-red-200">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Présence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comportement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Users className="h-12 w-12 text-gray-400" />
                          <div>
                            <p className="text-gray-700 font-medium">Aucun élève inscrit dans cette classe</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Les élèves doivent être ajoutés à la classe par l'administrateur
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Section Admin → Gestion des Classes → Gérer les étudiants
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {student.firstName?.[0]}{student.lastName?.[0]}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                            </div>
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          student.lastGrade >= 16 ? 'text-green-600' :
                          student.lastGrade >= 12 ? 'text-blue-600' :
                          student.lastGrade >= 10 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {student.lastGrade}/20
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                student.attendance >= 95 ? 'bg-green-500' :
                                student.attendance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{student.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBehaviorColor(student.behavior)}`}>
                          {student.behavior === 'excellent' ? 'Excellent' :
                           student.behavior === 'good' ? 'Bien' :
                           student.behavior === 'average' ? 'Moyen' : 'À améliorer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Profil
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Noter
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            Message
                          </button>
                        </div>
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

export default MyClasses;