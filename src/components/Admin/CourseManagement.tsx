import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, Calendar, User, Clock } from 'lucide-react';
import { Course } from '../../types';

const CourseManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Mathématiques - Algèbre',
      description: 'Introduction aux équations du premier degré',
      teacherId: '2',
      classId: '1',
      subject: 'Mathématiques',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-15'),
      materials: ['Manuel page 45-60', 'Exercices en ligne']
    },
    {
      id: '2',
      title: 'Histoire - Moyen Âge',
      description: 'La société féodale au Moyen Âge',
      teacherId: '3',
      classId: '1',
      subject: 'Histoire',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-03-10'),
      materials: ['Livre d\'histoire chapitre 3', 'Documentaire vidéo']
    },
    {
      id: '3',
      title: 'Français - Grammaire',
      description: 'Les classes grammaticales',
      teacherId: '4',
      classId: '2',
      subject: 'Français',
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-04-20'),
      materials: ['Manuel de grammaire', 'Exercices interactifs']
    }
  ]);

  const teachers = [
    { id: '2', name: 'Jean Martin' },
    { id: '3', name: 'Marie Dubois' },
    { id: '4', name: 'Pierre Morel' }
  ];

  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' }
  ];

  const subjects = ['Mathématiques', 'Français', 'Histoire', 'Géographie', 'Sciences', 'Anglais', 'Arts'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || course.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const AddCourseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Créer un nouveau cours</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du cours</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Description du cours..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Sélectionner un enseignant</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matériel pédagogique</label>
            <textarea 
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Liste du matériel nécessaire (un élément par ligne)"
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
              Créer le cours
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
          <p className="text-gray-600">Créez et gérez les cours de votre établissement</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau cours
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les matières</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {course.subject}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      {teachers.find(t => t.id === course.teacherId)?.name || 'Non assigné'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {course.startDate.toLocaleDateString('fr-FR')} - {course.endDate.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Classe: {classes.find(c => c.id === course.classId)?.name || 'Non assignée'}
                    </span>
                  </div>
                </div>

                {course.materials.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Matériel pédagogique:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {course.materials.map((material, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cours</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enseignants Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(courses.map(c => c.teacherId)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Matières</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(courses.map(c => c.subject)).size}
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
              <p className="text-sm font-medium text-gray-600">Cours Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => new Date() >= c.startDate && new Date() <= c.endDate).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddCourseModal />}
    </div>
  );
};

export default CourseManagement;