import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { classService, userService } from '../../services/api';
import { Class } from '../../types';

const ClassManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: '6ème A',
      level: '6ème',
      teacherId: '2',
      studentIds: ['3', '4', '5'],
      schedule: [
        {
          id: '1',
          day: 'Lundi',
          startTime: '08:00',
          endTime: '09:00',
          subject: 'Mathématiques',
          teacherId: '2',
          classId: '1',
          room: 'Salle 101'
        }
      ]
    },
    {
      id: '2',
      name: '6ème B',
      level: '6ème',
      teacherId: '2',
      studentIds: ['6', '7', '8'],
      schedule: []
    },
    {
      id: '3',
      name: '3ème A',
      level: '3ème',
      teacherId: '3',
      studentIds: ['9', '10', '11'],
      schedule: []
    }
  ]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AddClassModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      React.useEffect(() => {
        const loadTeachers = async () => {
          try {
            const response = await userService.getAll({ role: 'teacher' });
            setTeachers(response.users || response);
          } catch (error) {
            console.error('Erreur lors du chargement des enseignants:', error);
          }
        };
        loadTeachers();
      }, []);

      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Ajouter une classe</h3>
        <form onSubmit={handleAddClass} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la classe</label>
            <input 
              name="name"
              type="text" 
              placeholder="ex: 6ème A" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
            <select 
              name="level"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner un niveau</option>
              <option value="CP">CP</option>
              <option value="CE1">CE1</option>
              <option value="CE2">CE2</option>
              <option value="CM1">CM1</option>
              <option value="CM2">CM2</option>
              <option value="6ème">6ème</option>
              <option value="5ème">5ème</option>
              <option value="4ème">4ème</option>
              <option value="3ème">3ème</option>
              <option value="2nde">2nde</option>
              <option value="1ère">1ère</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professeur principal</label>
            <select 
              name="teacherId"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner un enseignant</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité maximale</label>
            <input 
              name="capacity"
              type="number" 
              placeholder="30" 
              defaultValue="30"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Description de la classe (optionnel)"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer la classe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const classData = {
        name: formData.get('name') as string,
        level: formData.get('level') as string,
        teacherId: formData.get('teacherId') as string || null,
        capacity: parseInt(formData.get('capacity') as string) || 30,
        description: formData.get('description') as string || null
      };

      await classService.create(classData);
      
      // Refresh the classes list
      const response = await classService.getAll();
      setClasses(response);
      
      setShowAddModal(false);
      alert('Classe créée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création de la classe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      return;
    }

    try {
      await classService.delete(classId);
      
      // Refresh the classes list
      const response = await classService.getAll();
      setClasses(response);
      
      alert('Classe supprimée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  // Load teachers on component mount
  React.useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await userService.getAll({ role: 'teacher' });
        setTeachers(response.users || response);
      } catch (error) {
        console.error('Erreur lors du chargement des enseignants:', error);
      }
    };
    loadTeachers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Classes</h1>
          <p className="text-gray-600">Organisez et gérez les classes de votre établissement</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle classe
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">{cls.level}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 
                    className="h-4 w-4" 
                    onClick={() => handleDeleteClass(cls.id)}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  Élèves
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {cls.studentIds.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Professeur principal
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {teachers.find(t => t.id === cls.teacherId) ? 
                    `${teachers.find(t => t.id === cls.teacherId)?.firstName} ${teachers.find(t => t.id === cls.teacherId)?.lastName}` : 
                    'Non assigné'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Cours programmés
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {cls.schedule.length}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  Voir détails
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                  Emploi du temps
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
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Élèves</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((acc, cls) => acc + cls.studentIds.length, 0)}
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
              <p className="text-sm font-medium text-gray-600">Moyenne par classe</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(classes.reduce((acc, cls) => acc + cls.studentIds.length, 0) / classes.length)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cours programmés</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((acc, cls) => acc + cls.schedule.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddClassModal />}
    </div>
  );
};

export default ClassManagement;