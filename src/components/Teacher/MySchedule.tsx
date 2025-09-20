import React, { useState } from 'react';
import { Calendar, Clock, Users, BookOpen, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Schedule } from '../../types';

const MySchedule: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Mock schedule data for the teacher
  const [schedules] = useState<Schedule[]>([
    {
      id: '1',
      day: 'Lundi',
      startTime: '08:00',
      endTime: '09:00',
      subject: 'Mathématiques',
      teacherId: '2',
      classId: '1',
      room: 'Salle 101'
    },
    {
      id: '2',
      day: 'Lundi',
      startTime: '10:00',
      endTime: '11:00',
      subject: 'Mathématiques',
      teacherId: '2',
      classId: '2',
      room: 'Salle 101'
    },
    {
      id: '3',
      day: 'Mardi',
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Algèbre',
      teacherId: '2',
      classId: '3',
      room: 'Salle 203'
    },
    {
      id: '4',
      day: 'Mardi',
      startTime: '14:00',
      endTime: '15:00',
      subject: 'Géométrie',
      teacherId: '2',
      classId: '1',
      room: 'Salle 101'
    },
    {
      id: '5',
      day: 'Mercredi',
      startTime: '08:00',
      endTime: '09:00',
      subject: 'Mathématiques',
      teacherId: '2',
      classId: '2',
      room: 'Salle 101'
    },
    {
      id: '6',
      day: 'Jeudi',
      startTime: '10:00',
      endTime: '11:00',
      subject: 'Algèbre',
      teacherId: '2',
      classId: '3',
      room: 'Salle 203'
    },
    {
      id: '7',
      day: 'Vendredi',
      startTime: '14:00',
      endTime: '15:00',
      subject: 'Mathématiques',
      teacherId: '2',
      classId: '1',
      room: 'Salle 101'
    }
  ]);

  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' }
  ];

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getScheduleForTimeSlot = (day: string, time: string) => {
    return schedules.find(s => s.day === day && s.startTime === time);
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
    return schedules.filter(s => s.day === todayCapitalized);
  };

  const getWeekStats = () => {
    const totalHours = schedules.length;
    const uniqueClasses = new Set(schedules.map(s => s.classId)).size;
    const subjects = new Set(schedules.map(s => s.subject)).size;
    
    return { totalHours, uniqueClasses, subjects };
  };

  const stats = getWeekStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Planning</h1>
          <p className="text-gray-600">Consultez votre emploi du temps hebdomadaire</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Jour
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek('prev')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Semaine précédente
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Semaine du {weekDates[0].toLocaleDateString('fr-FR')} au {weekDates[4].toLocaleDateString('fr-FR')}
            </h2>
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Semaine suivante
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Heures/Semaine</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueClasses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Matières</p>
              <p className="text-2xl font-bold text-gray-900">{stats.subjects}</p>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Weekly View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Heure
                  </th>
                  {days.map((day, index) => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div>
                        <div>{day}</div>
                        <div className="text-xs text-gray-400 font-normal">
                          {weekDates[index].toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                      {time}
                    </td>
                    {days.map((day) => {
                      const schedule = getScheduleForTimeSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-4 py-3 border-l border-gray-200">
                          {schedule ? (
                            <div className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded">
                              <div className="text-sm font-medium text-blue-900">
                                {schedule.subject}
                              </div>
                              <div className="text-xs text-blue-700">
                                {classes.find(c => c.id === schedule.classId)?.name}
                              </div>
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {schedule.room}
                              </div>
                              <div className="text-xs text-blue-600">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            </div>
                          ) : (
                            <div className="h-16"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Daily View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Cours d'aujourd'hui</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getTodaySchedule().length > 0 ? (
                getTodaySchedule().map((schedule) => (
                  <div key={schedule.id} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{schedule.subject}</h4>
                      <p className="text-sm text-gray-600">
                        {classes.find(c => c.id === schedule.classId)?.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {schedule.room}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Commencer
                      </button>
                      <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Détails
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours aujourd'hui</h3>
                  <p className="text-gray-600">Profitez de cette journée libre !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySchedule;