import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp, Calendar, Filter, Download } from 'lucide-react';
import { Grade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService, gradeService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const GradeManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'exam' | 'homework' | 'participation' | 'project'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    value: '',
    maxValue: '20',
    type: 'exam',
    date: new Date().toISOString().split('T')[0],
    comments: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
      fetchGrades();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchGrades();
      if (selectedCourse && selectedCourse !== 'all') {
        fetchStudents();
      } else {
        setStudents([]);
      }
    }
  }, [selectedCourse, selectedType]);

  const fetchCourses = async () => {
    try {
      const data = await teacherService.getCourses(user!.id);
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCourse && selectedCourse !== 'all') {
        params.courseId = selectedCourse;
      }
      const data = await gradeService.getAll(params);
      setGrades(data);
    } catch (err) {
      console.error('Erreur lors du chargement des notes:', err);
      setError('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await teacherService.getCourseStudents(selectedCourse);
      console.log('Students loaded:', response);
      setStudents(response || []);
      if (!response || response.length === 0) {
        console.warn('Aucun étudiant trouvé pour ce cours');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des étudiants:', err);
      console.error('Error details:', err.response?.data);
      setStudents([]);
      if (err.code === 'ERR_NETWORK') {
        setError('Erreur de connexion: Assurez-vous que le serveur backend est en cours d\'exécution sur le port 5000');
      } else {
        setError(`Impossible de charger les étudiants: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesType = selectedType === 'all' || grade.examType === selectedType || grade.type === selectedType;
    return matchesType;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

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

  const calculateClassAverage = () => {
    if (filteredGrades.length === 0) return 0;
    const total = filteredGrades.reduce((acc, grade) => acc + (grade.value / grade.maxValue) * 20, 0);
    return (total / filteredGrades.length).toFixed(1);
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.value || !formData.date) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await gradeService.create({
        studentId: formData.studentId,
        courseId: selectedCourse,
        value: parseFloat(formData.value),
        maxValue: parseFloat(formData.maxValue),
        type: formData.type,
        date: formData.date,
        comments: formData.comments
      });

      setShowAddModal(false);
      setFormData({
        studentId: '',
        value: '',
        maxValue: '20',
        type: 'exam',
        date: new Date().toISOString().split('T')[0],
        comments: ''
      });
      fetchGrades();
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de la note:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout de la note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      studentId: '',
      value: '',
      maxValue: '20',
      type: 'exam',
      date: new Date().toISOString().split('T')[0],
      comments: ''
    });
    setError('');
    setShowAddModal(true);
  };

  const AddGradeModal = () => {
    if (!selectedCourse || selectedCourse === 'all') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter une note</h3>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Veuillez sélectionner un cours spécifique pour ajouter une note.</p>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Ajouter une note</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleAddGrade} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Élève <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loadingStudents}
              >
                <option value="">
                  {loadingStudents
                    ? 'Chargement des élèves...'
                    : students.length === 0
                      ? 'Aucun élève inscrit dans ce cours'
                      : 'Sélectionner un élève'}
                </option>
                {students && students.length > 0 && students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
              {!loadingStudents && students.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  Aucun élève n'est inscrit dans la classe de ce cours. Veuillez d'abord ajouter des élèves dans la section "Mes Classes".
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.maxValue}
                  step="0.5"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sur <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxValue}
                  onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'évaluation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="exam">Contrôle</option>
                <option value="homework">Devoir</option>
                <option value="participation">Participation</option>
                <option value="project">Projet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
              <textarea
                rows={3}
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Commentaires sur la performance..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Ajout en cours...' : 'Ajouter la note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Notes</h1>
          <p className="text-gray-600">Saisissez et gérez les notes de vos élèves</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cours</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les cours</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'évaluation</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="exam">Contrôles</option>
              <option value="homework">Devoirs</option>
              <option value="participation">Participation</option>
              <option value="project">Projets</option>
            </select>
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
              <p className="text-sm font-medium text-gray-600">Moyenne Classe</p>
              <p className="text-2xl font-bold text-gray-900">{calculateClassAverage()}/20</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notes saisies</p>
              <p className="text-2xl font-bold text-gray-900">{filteredGrades.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Élèves évalués</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredGrades.map(g => g.studentId)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredGrades.length > 0 ? Math.round((filteredGrades.filter(g => ((g.grade || g.value) / (g.maxGrade || g.maxValue)) >= 0.5).length / filteredGrades.length) * 100) : 0}%
              </p>
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
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commentaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune note trouvée
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade, index) => (
                  <tr key={`grade-${index}-${grade.id || ''}-${grade.studentId || ''}-${grade.courseId || ''}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.studentName || 'Élève inconnu'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${getGradeColor(grade.grade || grade.value, grade.maxGrade || grade.maxValue)}`}>
                        {grade.grade || grade.value}/{grade.maxGrade || grade.maxValue}
                      </span>
                      <div className="text-xs text-gray-500">
                        {Math.round(((grade.grade || grade.value) / (grade.maxGrade || grade.maxValue)) * 100)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(grade.examType || grade.type)}`}>
                        {getTypeLabel(grade.examType || grade.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.date ? new Date(grade.date).toLocaleDateString('fr-FR') : grade.createdAt ? new Date(grade.createdAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {grade.comments || '-'}
                      </div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <AddGradeModal />}
    </div>
  );
};

export default GradeManagement;