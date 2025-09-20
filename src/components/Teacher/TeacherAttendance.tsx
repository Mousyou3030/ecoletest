import React, { useState } from 'react';
import { Search, Calendar, Users, CheckCircle, XCircle, Clock, Filter, Save } from 'lucide-react';
import { Attendance } from '../../types';

const TeacherAttendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data
  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' }
  ];

  const students = [
    { id: '1', name: 'Sophie Dupont', class: '6ème A' },
    { id: '2', name: 'Lucas Martin', class: '6ème A' },
    { id: '3', name: 'Emma Bernard', class: '6ème A' },
    { id: '4', name: 'Thomas Dubois', class: '6ème A' },
    { id: '5', name: 'Marie Leroy', class: '6ème B' },
    { id: '6', name: 'Paul Moreau', class: '6ème B' }
  ];

  const [attendances, setAttendances] = useState<Attendance[]>([
    {
      id: '1',
      studentId: '1',
      date: new Date(),
      status: 'present',
      notes: ''
    },
    {
      id: '2',
      studentId: '2',
      date: new Date(),
      status: 'present',
      notes: ''
    },
    {
      id: '3',
      studentId: '3',
      date: new Date(),
      status: 'present',
      notes: ''
    },
    {
      id: '4',
      studentId: '4',
      date: new Date(),
      status: 'present',
      notes: ''
    }
  ]);

  const getClassStudents = () => {
    return students.filter(student => {
      const cls = classes.find(c => c.id === selectedClass);
      return student.class === cls?.name;
    });
  };

  const getStudentAttendance = (studentId: string) => {
    return attendances.find(att => att.studentId === studentId);
  };

  const updateAttendance = (studentId: string, status: string, notes?: string) => {
    setAttendances(prev => {
      const existing = prev.find(att => att.studentId === studentId);
      if (existing) {
        return prev.map(att => 
          att.studentId === studentId 
            ? { ...att, status: status as any, notes: notes || '' }
            : att
        );
      } else {
        return [...prev, {
          id: Date.now().toString(),
          studentId,
          date: new Date(selectedDate),
          status: status as any,
          notes: notes || ''
        }];
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'excused': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const calculateStats = () => {
    const classStudents = getClassStudents();
    const total = classStudents.length;
    const present = classStudents.filter(student => {
      const attendance = getStudentAttendance(student.id);
      return attendance?.status === 'present';
    }).length;
    const absent = classStudents.filter(student => {
      const attendance = getStudentAttendance(student.id);
      return attendance?.status === 'absent';
    }).length;
    const late = classStudents.filter(student => {
      const attendance = getStudentAttendance(student.id);
      return attendance?.status === 'late';
    }).length;

    return { total, present, absent, late };
  };

  const stats = calculateStats();

  const saveAttendances = () => {
    // In a real app, this would save to the backend
    alert('Présences sauvegardées avec succès !');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
          <p className="text-gray-600">Marquez les présences de vos élèves</p>
        </div>
        <button
          onClick={saveAttendances}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Élèves</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Présents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Retards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              getClassStudents().forEach(student => {
                updateAttendance(student.id, 'present');
              });
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
          >
            Marquer tous présents
          </button>
          <button
            onClick={() => {
              getClassStudents().forEach(student => {
                updateAttendance(student.id, 'absent');
              });
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
          >
            Marquer tous absents
          </button>
          <button
            onClick={() => {
              setAttendances(prev => prev.filter(att => 
                !getClassStudents().some(student => student.id === att.studentId)
              ));
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Présences - {classes.find(c => c.id === selectedClass)?.name}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {getClassStudents().map((student) => {
            const attendance = getStudentAttendance(student.id);
            return (
              <div key={student.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.class}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      {['present', 'absent', 'late', 'excused'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateAttendance(student.id, status)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            attendance?.status === status
                              ? status === 'present' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                                status === 'absent' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                                status === 'late' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                                'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status === 'present' ? 'Présent' :
                           status === 'absent' ? 'Absent' :
                           status === 'late' ? 'Retard' : 'Excusé'}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center">
                      {attendance && getStatusIcon(attendance.status)}
                    </div>
                  </div>
                </div>
                
                {attendance?.status === 'absent' || attendance?.status === 'late' ? (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <input
                      type="text"
                      value={attendance.notes || ''}
                      onChange={(e) => updateAttendance(student.id, attendance.status, e.target.value)}
                      placeholder="Raison de l'absence ou du retard..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;