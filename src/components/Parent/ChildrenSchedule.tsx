import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

interface ScheduleItem {
  id: string;
  studentId: string;
  studentName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
}

const ChildrenSchedule: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children]);

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
      const schedulesPromises = childIds.map((childId: string) =>
        axios.get(`${API_BASE_URL}/schedules/student/${childId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      );

      const schedulesResponses = await Promise.all(schedulesPromises);
      const allSchedules = schedulesResponses.flatMap((response, index) =>
        response.data.map((schedule: any) => ({
          ...schedule,
          studentId: childIds[index],
          studentName: `${childrenResponse.data[index].firstName} ${childrenResponse.data[index].lastName}`
        }))
      );

      setSchedules(allSchedules);
    } catch (error) {
      console.error('Erreur lors du chargement des emplois du temps:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForDay = (day: string) => {
    return schedules
      .filter(s => s.studentId === selectedChild && s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning des Enfants</h1>
          <p className="text-gray-600">Emplois du temps hebdomadaires</p>
        </div>
        {children.length > 0 && (
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      {children.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun enfant associé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {daysOfWeek.map(day => {
            const daySchedule = getScheduleForDay(day);
            return (
              <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                    <span className="ml-3 text-sm text-gray-500">
                      {daySchedule.length} cours
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {daySchedule.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Aucun cours ce jour</p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedule.map(schedule => (
                        <div
                          key={schedule.id}
                          className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-shrink-0 w-24">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              {schedule.startTime}
                            </div>
                            <div className="text-xs text-gray-500 ml-5">
                              {schedule.endTime}
                            </div>
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="flex items-center mb-1">
                              <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                              <h4 className="font-semibold text-gray-900">{schedule.subject}</h4>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-3 w-3 mr-1" />
                              <span>{schedule.teacher}</span>
                              <span className="mx-2">•</span>
                              <span>Salle {schedule.room}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChildrenSchedule;
