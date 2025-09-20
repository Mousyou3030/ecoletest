import React, { useState } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, MessageSquare, FileText } from 'lucide-react';

const MyClasses: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('1');

  // Mock data for teacher's classes
  const myClasses = [
    {
      id: '1',
      name: '6ème A',
      subject: 'Mathématiques',
      studentCount: 28,
      averageGrade: 14.2,
      attendanceRate: 95,
      nextLesson: { date: 'Aujourd\'hui', time: '10:00', topic: 'Équations du 1er degré' }
    },
    {
      id: '2',
      name: '6ème B',
      subject: 'Mathématiques',
      studentCount: 26,
      averageGrade: 13.8,
      attendanceRate: 92,
      nextLesson: { date: 'Demain', time: '08:00', topic: 'Fractions' }
    },
    {
      id: '3',
      name: '3ème A',
      subject: 'Algèbre',
      studentCount: 24,
      averageGrade: 15.1,
      attendanceRate: 97,
      nextLesson: { date: 'Lundi', time: '14:00', topic: 'Fonctions linéaires' }
    }
  ];

  // Mock students data for selected class
  const students = [
    {
      id: '1',
      name: 'Sophie Dupont',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastGrade: 16,
      attendance: 98,
      behavior: 'excellent'
    },
    {
      id: '2',
      name: 'Lucas Martin',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastGrade: 12,
      attendance: 89,
      behavior: 'good'
    },
    {
      id: '3',
      name: 'Emma Bernard',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastGrade: 18,
      attendance: 100,
      behavior: 'excellent'
    },
    {
      id: '4',
      name: 'Thomas Dubois',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastGrade: 14,
      attendance: 94,
      behavior: 'good'
    }
  ];

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
              {cls.name} - {cls.subject}
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
                  <p className="text-sm font-bold text-gray-900">{selectedClassData.nextLesson.date}</p>
                  <p className="text-xs text-gray-500">{selectedClassData.nextLesson.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Lesson Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Prochain cours: {selectedClassData.name}</h3>
                <p className="text-blue-700">{selectedClassData.nextLesson.topic}</p>
                <p className="text-sm text-blue-600">
                  {selectedClassData.nextLesson.date} à {selectedClassData.nextLesson.time}
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
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.avatar}
                              alt=""
                            />
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
                  ))}
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