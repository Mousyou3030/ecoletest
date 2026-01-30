import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Schedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  room: string;
  className: string;
}

const MySchedule: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await scheduleService.getAll({ studentId: user?.id });
      setSchedules(response);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', err);
      setError('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  const getSchedulesByDay = (day: string) => {
    return schedules
      .filter(s => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Planning</h1>
        <p className="text-gray-600">Votre emploi du temps de la semaine</p>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun emploi du temps disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {daysOfWeek.map(day => {
            const daySchedules = getSchedulesByDay(day);

            return (
              <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <h3 className="text-lg font-semibold text-white">{day}</h3>
                </div>
                <div className="p-4">
                  {daySchedules.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Pas de cours</p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedules.map(schedule => (
                        <div key={schedule.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{schedule.subject}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {schedule.className}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-2" />
                              <span>{schedule.startTime} - {schedule.endTime}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-2" />
                              <span>{schedule.teacherName}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-2" />
                              <span>{schedule.room}</span>
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

export default MySchedule;
