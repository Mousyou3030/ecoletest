import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock, Users, BookOpen, Filter } from 'lucide-react';
import { Schedule } from '../../types';

const ScheduleManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' },
    { id: '4', name: '3ème B' }
  ];

  const teachers = [
    { id: '2', name: 'Jean Martin', subject: 'Mathématiques' },
    { id: '3', name: 'Marie Dubois', subject: 'Français' },
    { id: '4', name: 'Pierre Morel', subject: 'Histoire' },
    { id: '5', name: 'Sophie Bernard', subject: 'Anglais' }
  ];

  const [schedules, setSchedules] = useState<Schedule[]>([
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
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Français',
      teacherId: '3',
      classId: '1',
      room: 'Salle 102'
    },
    {
      id: '3',
      day: 'Mardi',
      startTime: '10:00',
      endTime: '11:00',
      subject: 'Histoire',
      teacherId: '4',
      classId: '2',
      room: 'Salle 201'
    },
    {
      id: '4',
      day: 'Mercredi',
      startTime: '14:00',
      endTime: '15:00',
      subject: 'Anglais',
      teacherId: '5',
      classId: '3',
      room: 'Salle 301'
    }
  ]);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];

  const filteredSchedules = schedules.filter(schedule => {
    const matchesClass = selectedClass === 'all' || schedule.classId === selectedClass;
    const matchesDay = selectedDay === 'all' || schedule.day === selectedDay;
    return matchesClass && matchesDay;
  });

  const AddScheduleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Ajouter un créneau</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Sélectionner une classe</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Sélectionner un jour</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
              <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
              <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Nom de la matière" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Sélectionner un enseignant</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} - {teacher.subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="ex: Salle 101" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Emplois du Temps</h1>
          <p className="text-gray-600">Planifiez et organisez les cours de votre établissement</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau créneau
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les jours</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matière
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {schedule.day}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      {schedule.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classes.find(c => c.id === schedule.classId)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teachers.find(t => t.id === schedule.teacherId)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Créneaux</p>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes Actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(schedules.map(s => s.classId)).size}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {new Set(schedules.map(s => s.subject)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Heures/Semaine</p>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddScheduleModal />}
    </div>
  );
};

export default ScheduleManagement;