import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp, Calendar, Filter, Download, Eye, Users } from 'lucide-react';
import { Grade } from '../../types';

const GradeManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'exam' | 'homework' | 'participation' | 'project'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Mock data
  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' },
    { id: '4', name: '3ème B' }
  ];

  const subjects = ['Mathématiques', 'Français', 'Histoire', 'Géographie', 'Sciences', 'Anglais', 'Arts'];

  const students = [
    { id: '1', name: 'Sophie Dupont', class: '6ème A' },
    { id: '2', name: 'Lucas Martin', class: '6ème A' },
    { id: '3', name: 'Emma Bernard', class: '6ème B' },
    { id: '4', name: 'Thomas Dubois', class: '3ème A' }
  ];

  const teachers = [
    { id: '2', name: 'Jean Martin', subject: 'Mathématiques' },
    { id: '3', name: 'Marie Dubois', subject: 'Français' },
    { id: '4', name: 'Pierre Morel', subject: 'Histoire' }
  ];

  const [grades, setGrades] = useState<Grade[]>([
    {
      id: '1',
      studentId: '1',
      courseId: '1',
      teacherId: '2',
      value: 16,
      maxValue: 20,
      type: 'exam',
      date: new Date('2024-01-15'),
      comments: 'Très bon travail'
    },
    {
      id: '2',
      studentId: '2',
      courseId: '1',
      teacherId: '2',
      value: 12,
      maxValue: 20,
      type: 'homework',
      date: new Date('2024-01-14'),
      comments: 'Peut mieux faire'
    },
    {
      id: '3',
      studentId: '3',
      courseId: '2',
      teacherId: '3',
      value: 18,
      maxValue: 20,
      type: 'exam',
      date: new Date('2024-01-15'),
      comments: 'Excellent'
    },
    {
      id: '4',
      studentId: '4',
      courseId: '3',
      teacherId: '4',
      value: 14,
      maxValue: 20,
      type: 'participation',
      date: new Date('2024-01-13'),
      comments: 'Bonne participation'
    }
  ]);

  const filteredGrades = grades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId);
    const teacher = teachers.find(t => t.id === grade.teacherId);
    
    const matchesClass = selectedClass === 'all' || student?.class === classes.find(c => c.id === selectedClass)?.name;
    const matchesSubject = selectedSubject === 'all' || teacher?.subject === selectedSubject;
    const matchesType = selectedType === 'all' || grade.type === selectedType;
    
    return matchesClass && matchesSubject && matchesType;
  });

  const getGradeColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Contrôle';
      case 'homework': return 'Devoir';
      case 'participation': return 'Participation';
      case 'project': return 'Projet';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'participation': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const totalGrades = filteredGrades.length;
    const averageGrade = totalGrades > 0 ? 
      (filteredGrades.reduce((acc, grade) => acc + (grade.value / grade.maxValue) * 20, 0) / totalGrades).toFixed(1) : 0;
    const passRate = totalGrades > 0 ? 
      Math.round((filteredGrades.filter(g => (g.value / g.maxValue) >= 0.5).length / totalGrades) * 100) : 0;
    const studentsEvaluated = new Set(filteredGrades.map(g => g.studentId)).size;

    return { totalGrades, averageGrade, passRate, studentsEvaluated };
  };

  const stats = calculateStats();

  const AddGradeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Ajouter une note</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Sélectionner un élève</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name} - {student.class}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Sélectionner une matière</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input type="number" min="0" max="20" step="0.5" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sur</label>
              <input type="number" min="1" max="20" defaultValue="20" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'évaluation</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="exam">Contrôle</option>
              <option value="homework">Devoir</option>
              <option value="participation">Participation</option>
              <option value="project">Projet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
            <textarea 
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Commentaires sur la performance..."
            ></textarea>
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
              Ajouter la note
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const BulkGradeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Saisie de notes en lot</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Sélectionner une matière</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'évaluation</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="exam">Contrôle</option>
                <option value="homework">Devoir</option>
                <option value="participation">Participation</option>
                <option value="project">Projet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note sur</label>
              <input type="number" min="1" max="20" defaultValue="20" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
            <h4 className="font-medium mb-3">Notes par élève :</h4>
            <div className="space-y-2">
              {students.slice(0, 4).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{student.name}</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="20" 
                    step="0.5" 
                    placeholder="Note"
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer les notes
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Notes</h1>
          <p className="text-gray-600">Supervision et gestion de toutes les évaluations</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Saisie en lot
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les matières</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'évaluation</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="exam">Contrôles</option>
              <option value="homework">Devoirs</option>
              <option value="participation">Participation</option>
              <option value="project">Projets</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moyenne Générale</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}/20</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notes Saisies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGrades}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Élèves Évalués</p>
              <p className="text-2xl font-bold text-gray-900">{stats.studentsEvaluated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
              <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matière
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => {
                const student = students.find(s => s.id === grade.studentId);
                const teacher = teachers.find(t => t.id === grade.teacherId);
                return (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student?.class}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {teacher?.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${getGradeColor(grade.value, grade.maxValue)}`}>
                        {grade.value}/{grade.maxValue}
                      </span>
                      <div className="text-xs text-gray-500">
                        {Math.round((grade.value / grade.maxValue) * 100)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(grade.type)}`}>
                        {getTypeLabel(grade.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.date.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <AddGradeModal />}
      {showBulkModal && <BulkGradeModal />}
    </div>
  );
};

export default GradeManagement;