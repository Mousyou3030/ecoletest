import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, BookOpen, Calendar, User, Clock } from 'lucide-react';
import { courseService, userService, classService } from '../../services/api';
import { Course } from '../../types';

const CourseManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

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
        <form onSubmit={handleAddCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du cours</label>
              <input 
                name="title"
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select 
                name="subject"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
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
              name="description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Description du cours..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
              <select 
                name="teacherId"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select 
                name="classId"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
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
              <input 
                name="startDate"
                type="date" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input 
                name="endDate"
                type="date" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matériel pédagogique</label>
            <textarea 
              name="materials"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le cours'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const materialsText = formData.get('materials') as string;
      const materials = materialsText ? materialsText.split('\n').filter(m => m.trim()) : [];
      
      const courseData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        subject: formData.get('subject') as string,
        teacherId: formData.get('teacherId') as string,
        classId: formData.get('classId') as string,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        materials
      };

      await courseService.create(courseData);

      // Refresh the courses list
      await fetchCourses();

      setShowAddModal(false);
      alert('Cours créé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      await courseService.delete(courseId);

      // Refresh the courses list
      await fetchCourses();

      alert('Cours supprimé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll();
      setCourses(response.data || response);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load teachers, classes, and courses on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersResponse, classesResponse] = await Promise.all([
          userService.getAll({ role: 'teacher' }),
          classService.getAll()
        ]);

        // Handle different response formats
        const teachersData = Array.isArray(teachersResponse) ? teachersResponse :
                           (teachersResponse.data && Array.isArray(teachersResponse.data) ? teachersResponse.data : []);
        const classesData = Array.isArray(classesResponse) ? classesResponse :
                          (classesResponse.data && Array.isArray(classesResponse.data) ? classesResponse.data : []);

        console.log('Teachers loaded:', teachersData);
        console.log('Classes loaded:', classesData);

        setTeachers(teachersData);
        setClasses(classesData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setTeachers([]);
        setClasses([]);
        setDataLoaded(true);
      }
    };
    loadData();
    fetchCourses();
  }, []);

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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Chargement des cours...</div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Aucun cours trouvé</div>
          </div>
        ) : (
          filteredCourses.map((course) => (
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
                      {teachers.find(t => t.id === course.teacherId) ? 
                        `${teachers.find(t => t.id === course.teacherId)?.firstName} ${teachers.find(t => t.id === course.teacherId)?.lastName}` : 
                        'Non assigné'}
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
                  <Trash2 
                    className="h-4 w-4" 
                    onClick={() => handleDeleteCourse(course.id)}
                  />
                </button>
              </div>
            </div>
          </div>
          ))
        )}
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
                {teachers.length}
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