import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, Calendar, Users, Clock, FileText } from 'lucide-react';
import { Course } from '../../types';

const MyCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for teacher's courses
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Algèbre - Équations du premier degré',
      description: 'Introduction aux équations linéaires et leur résolution',
      teacherId: '2',
      classId: '1',
      subject: 'Mathématiques',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      materials: ['Manuel page 45-60', 'Exercices en ligne', 'Calculatrice']
    },
    {
      id: '2',
      title: 'Géométrie - Triangles et cercles',
      description: 'Propriétés des triangles et construction de cercles',
      teacherId: '2',
      classId: '2',
      subject: 'Mathématiques',
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-04-20'),
      materials: ['Compas', 'Règle', 'Équerre', 'Manuel chapitre 8']
    },
    {
      id: '3',
      title: 'Fonctions linéaires',
      description: 'Étude des fonctions du type f(x) = ax + b',
      teacherId: '2',
      classId: '3',
      subject: 'Mathématiques',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      materials: ['Graphiques', 'Calculatrice graphique', 'Exercices pratiques']
    }
  ]);

  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AddCourseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Créer un nouveau cours</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du cours</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
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
              <input type="text" defaultValue="Mathématiques" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Matériel nécessaire</label>
            <textarea 
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Liste du matériel (un élément par ligne)"
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
          <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
          <p className="text-gray-600">Gérez vos cours et programmes pédagogiques</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau cours
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(courses.map(c => c.classId)).size}
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
              <p className="text-sm font-medium text-gray-600">Cours Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => new Date() >= c.startDate && new Date() <= c.endDate).length}
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
              <p className="text-sm font-medium text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => new Date() < c.startDate).length}
              </p>
            </div>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      Classe: {classes.find(c => c.id === course.classId)?.name || 'Non assignée'}
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
                      {new Date() >= course.startDate && new Date() <= course.endDate ? 'En cours' : 
                       new Date() < course.startDate ? 'À venir' : 'Terminé'}
                    </span>
                  </div>
                </div>

                {course.materials.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Matériel nécessaire:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.materials.map((material, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          <FileText className="h-3 w-3 mr-1" />
                          {material}
                        </span>
                      ))}
                    </div>
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

      {showAddModal && <AddCourseModal />}
    </div>
  );
};

export default MyCourses;