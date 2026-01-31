import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  reason: string;
}

const ChildrenAttendance: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
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
      const attendancesPromises = childIds.map((childId: string) =>
        axios.get(`${API_BASE_URL}/attendances/student/${childId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      const attendancesResponses = await Promise.all(attendancesPromises);
      const allAttendances = attendancesResponses.flatMap((response, index) =>
        response.data.map((attendance: any) => ({
          ...attendance,
          studentId: childIds[index],
          studentName: `${childrenResponse.data[index].firstName} ${childrenResponse.data[index].lastName}`
        }))
      );

      setAttendances(allAttendances);
    } catch (error) {
      console.error('Erreur lors du chargement des présences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendances = selectedChild === 'all'
    ? attendances
    : attendances.filter(a => a.studentId === selectedChild);

  const calculateStats = (childId: string) => {
    const childAttendances = attendances.filter(a => a.studentId === childId);
    const total = childAttendances.length;
    const present = childAttendances.filter(a => a.status === 'present').length;
    const absent = childAttendances.filter(a => a.status === 'absent').length;
    const late = childAttendances.filter(a => a.status === 'late').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, late, rate };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
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
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Présences des Enfants</h1>
          <p className="text-gray-600">Suivi de l'assiduité scolaire</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => {
              const stats = calculateStats(child.id);
              return (
                <div key={child.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{child.firstName}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de présence</span>
                      <span className="text-lg font-bold text-green-600">{stats.rate}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Présent</span>
                      <span className="font-semibold text-green-700">{stats.present}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Absent</span>
                      <span className="font-semibold text-red-700">{stats.absent}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Retard</span>
                      <span className="font-semibold text-orange-700">{stats.late}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Élève</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Raison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        Aucune donnée de présence disponible
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(attendance => (
                        <tr key={attendance.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">{attendance.studentName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-gray-700">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              {new Date(attendance.date).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              {getStatusIcon(attendance.status)}
                              <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(attendance.status)}`}>
                                {getStatusLabel(attendance.status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {attendance.reason || '-'}
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

export default ChildrenAttendance;
