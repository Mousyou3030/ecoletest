import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Attendance {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  courseName: string;
  subject: string;
  notes?: string;
}

const MyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  );

  useEffect(() => {
    fetchAttendances();
  }, [selectedMonth]);

  const fetchAttendances = async () => {
    try {
      const response = await attendanceService.getAll({ studentId: user?.id, month: selectedMonth });
      setAttendances(response);
    } catch (err) {
      console.error('Erreur lors du chargement des présences:', err);
      setError('Erreur lors du chargement des présences');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Retard';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700';
      case 'late':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateStats = () => {
    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'present').length;
    const absent = attendances.filter(a => a.status === 'absent').length;
    const late = attendances.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, percentage };
  };

  const stats = calculateStats();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Présences</h1>
        <p className="text-gray-600">Consultez votre assiduité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Taux de présence</p>
              <p className="text-3xl font-bold">{stats.percentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Présent</p>
              <p className="text-3xl font-bold">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 mr-3" />
            <div>
              <p className="text-red-100">Absent</p>
              <p className="text-3xl font-bold">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Clock className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Retard</p>
              <p className="text-3xl font-bold">{stats.late}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historique</h3>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {attendances.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune donnée de présence pour cette période</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Matière</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map(attendance => (
                  <tr key={attendance.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(attendance.date)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{attendance.courseName}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{attendance.subject}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(attendance.status)}
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(attendance.status)}`}>
                          {getStatusText(attendance.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {attendance.notes || '-'}
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

export default MyAttendance;
