import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, CheckCircle, XCircle, Clock, Save, RefreshCw } from 'lucide-react';
import { supabaseClassService, supabaseAttendanceService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AttendanceRecord {
  id?: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

interface Stats {
  total: number;
  present: number;
  absent: number;
  late: number;
}

const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadAttendances();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classesData = await supabaseClassService.getAll();
      setClasses(classesData);
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await supabaseClassService.getStudents(selectedClass);
      setStudents(studentsData);
    } catch (err: any) {
      setError('Erreur lors du chargement des élèves');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const attendancesData = await supabaseAttendanceService.getAll({
        classId: selectedClass,
        date: selectedDate
      });

      const mappedAttendances = attendancesData.map(att => ({
        id: att.id,
        studentId: att.studentId,
        classId: att.classId,
        date: att.date.toISOString().split('T')[0],
        status: att.status,
        notes: att.notes || ''
      }));

      setAttendances(mappedAttendances);
    } catch (err: any) {
      setError('Erreur lors du chargement des présences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendances = () => {
    const newAttendances: AttendanceRecord[] = students.map(student => {
      const existing = attendances.find(att => att.studentId === student.id);
      return existing || {
        studentId: student.id,
        classId: selectedClass,
        date: selectedDate,
        status: 'present',
        notes: ''
      };
    });
    setAttendances(newAttendances);
    setSuccessMessage('Élèves chargés avec succès !');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStudentAttendance = (studentId: string) => {
    return attendances.find(att => att.studentId === studentId);
  };

  const updateAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused', notes?: string) => {
    setAttendances(prev => {
      const existing = prev.find(att => att.studentId === studentId);
      if (existing) {
        return prev.map(att =>
          att.studentId === studentId
            ? { ...att, status, notes: notes !== undefined ? notes : att.notes }
            : att
        );
      } else {
        return [...prev, {
          studentId,
          classId: selectedClass,
          date: selectedDate,
          status,
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

  const calculateStats = (): Stats => {
    const total = students.length;
    const present = students.filter(student => {
      const attendance = getStudentAttendance(student.id);
      return attendance?.status === 'present';
    }).length;
    const absent = students.filter(student => {
      const attendance = getStudentAttendance(student.id);
      return attendance?.status === 'absent';
    }).length;
    const late = students.filter(student => {
      const attendance = getStudentAttendance(student.id);
      return attendance?.status === 'late';
    }).length;

    return { total, present, absent, late };
  };

  const stats = calculateStats();

  const saveAttendances = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const attendancesData = attendances.map(att => ({
        studentId: att.studentId,
        courseId: null,
        classId: selectedClass,
        date: selectedDate,
        status: att.status,
        notes: att.notes,
        markedBy: user.id
      }));

      await supabaseAttendanceService.bulkCreate(attendancesData);
      setSuccessMessage('Présences sauvegardées avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAttendances();
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde des présences: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
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
          disabled={saving || attendances.length === 0}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <button
              onClick={initializeAttendances}
              disabled={students.length === 0}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Charger les élèves
            </button>
          </div>
        </div>
      </div>

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

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              students.forEach(student => {
                updateAttendance(student.id, 'present');
              });
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
          >
            Marquer tous présents
          </button>
          <button
            onClick={() => {
              students.forEach(student => {
                updateAttendance(student.id, 'absent');
              });
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
          >
            Marquer tous absents
          </button>
          <button
            onClick={() => {
              setAttendances([]);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-600">
            Aucun élève dans cette classe. Veuillez sélectionner une autre classe.
          </div>
        </div>
      ) : (
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
            {students.map((student) => {
              const attendance = getStudentAttendance(student.id);
              return (
                <div key={student.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
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
      )}
    </div>
  );
};

export default TeacherAttendance;
