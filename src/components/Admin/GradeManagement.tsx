import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp, Calendar, Filter, Download, Eye, Users } from 'lucide-react';
import { Grade } from '../../types';
import { gradeService, userService, courseService, classService } from '../../services/api';

const GradeManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'exam' | 'homework' | 'participation' | 'project'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkType, setBulkType] = useState<'exam' | 'homework' | 'participation' | 'project'>('exam');
  const [bulkMaxValue, setBulkMaxValue] = useState(20);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentGrades, setStudentGrades] = useState<{ [key: string]: string }>({});

  const subjects = ['Mathématiques', 'Français', 'Histoire', 'Géographie', 'Sciences', 'Anglais', 'Arts'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [gradesResponse, studentsResponse, coursesResponse, classesResponse] = await Promise.all([
        gradeService.getAll(),
        userService.getAll({ role: 'student' }),
        courseService.getAll(),
        classService.getAll()
      ]);

      console.log('Grades Response:', gradesResponse);
      console.log('Students Response:', studentsResponse);
      console.log('Courses Response:', coursesResponse);
      console.log('Classes Response:', classesResponse);

      const gradesData = Array.isArray(gradesResponse) ? gradesResponse : gradesResponse?.grades || [];
      const studentsData = Array.isArray(studentsResponse) ? studentsResponse : studentsResponse?.users || [];
      const coursesData = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.courses || [];
      const classesData = Array.isArray(classesResponse) ? classesResponse : classesResponse?.classes || [];

      setGrades(gradesData);
      setStudents(studentsData);
      setCourses(coursesData);
      setClasses(classesData);

      console.log('Grades loaded:', gradesData.length);
      console.log('Students loaded:', studentsData.length);
      console.log('Courses loaded:', coursesData.length);
      console.log('Classes loaded:', classesData.length);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const getCourseInfo = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const getClassInfo = (classId: string) => {
    return classes.find(c => c.id === classId);
  };

  const filteredGrades = grades.filter(grade => {
    const course = getCourseInfo(grade.courseId);
    const matchesClass = selectedClass === 'all' || course?.classId === selectedClass;
    const matchesSubject = selectedSubject === 'all' || course?.subject === selectedSubject;
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

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      await gradeService.delete(gradeId);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Erreur lors de la suppression de la note');
    }
  };

  const AddGradeModal = () => {
    const [formData, setFormData] = useState({
      studentId: '',
      courseId: '',
      value: '',
      maxValue: '20',
      type: 'exam' as 'exam' | 'homework' | 'participation' | 'project',
      date: new Date().toISOString().split('T')[0],
      comments: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.studentId || !formData.courseId || !formData.value) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      try {
        const course = courses.find(c => c.id === formData.courseId);
        await gradeService.create({
          studentId: formData.studentId,
          courseId: formData.courseId,
          teacherId: course?.teacherId || currentUser.id,
          value: parseFloat(formData.value),
          maxValue: parseFloat(formData.maxValue),
          type: formData.type,
          date: formData.date,
          comments: formData.comments
        });

        setShowAddModal(false);
        await loadAllData();
        alert('Note ajoutée avec succès !');
      } catch (error) {
        console.error('Error creating grade:', error);
        alert('Erreur lors de la création de la note');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Ajouter une note</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Élève *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Sélectionner un élève</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Aucun élève trouvé dans la base de données</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cours *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Sélectionner un cours</option>
                {courses.map(course => {
                  const classInfo = getClassInfo(course.classId);
                  return (
                    <option key={course.id} value={course.id}>
                      {course.title} - {course.subject} ({classInfo?.name})
                    </option>
                  );
                })}
              </select>
              {courses.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Aucun cours trouvé. Créez d'abord des cours dans l'onglet "Cours"</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note *</label>
                <input
                  type="number"
                  min="0"
                  max={formData.maxValue}
                  step="0.5"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sur *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxValue}
                  onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'évaluation *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="exam">Contrôle</option>
                <option value="homework">Devoir</option>
                <option value="participation">Participation</option>
                <option value="project">Projet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
              <textarea
                rows={3}
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
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
                disabled={students.length === 0 || courses.length === 0}
              >
                Ajouter la note
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BulkGradeModal = () => {
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);

    useEffect(() => {
      if (bulkClassId && bulkCourseId) {
        const course = courses.find(c => c.id === bulkCourseId);
        if (course) {
          const classStudents = students.filter(student => {
            return true;
          });
          setFilteredStudents(classStudents);
        }
      } else {
        setFilteredStudents([]);
      }
    }, [bulkClassId, bulkCourseId]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!bulkClassId || !bulkCourseId) {
        alert('Veuillez sélectionner une classe et un cours');
        return;
      }

      const gradesToCreate = Object.entries(studentGrades)
        .filter(([_, value]) => value && value.trim() !== '')
        .map(([studentId, value]) => ({
          studentId,
          courseId: bulkCourseId,
          teacherId: currentUser.id,
          value: parseFloat(value),
          maxValue: bulkMaxValue,
          type: bulkType,
          date: bulkDate,
          comments: ''
        }));

      if (gradesToCreate.length === 0) {
        alert('Veuillez saisir au moins une note');
        return;
      }

      try {
        for (const gradeData of gradesToCreate) {
          await gradeService.create(gradeData);
        }

        setShowBulkModal(false);
        setBulkClassId('');
        setBulkCourseId('');
        setStudentGrades({});
        await loadAllData();
        alert(`${gradesToCreate.length} note(s) ajoutée(s) avec succès !`);
      } catch (error) {
        console.error('Error creating bulk grades:', error);
        alert('Erreur lors de la création des notes');
      }
    };

    const availableCourses = bulkClassId
      ? courses.filter(c => c.classId === bulkClassId)
      : [];

    console.log('Selected bulkClassId:', bulkClassId);
    console.log('All courses:', courses);
    console.log('Available courses for this class:', availableCourses);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Saisie de notes en lot</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                <select
                  value={bulkClassId}
                  onChange={(e) => {
                    setBulkClassId(e.target.value);
                    setBulkCourseId('');
                    setStudentGrades({});
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cours *</label>
                <select
                  value={bulkCourseId}
                  onChange={(e) => setBulkCourseId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={!bulkClassId}
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} - {course.subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'évaluation</label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="exam">Contrôle</option>
                  <option value="homework">Devoir</option>
                  <option value="participation">Participation</option>
                  <option value="project">Projet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note sur</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bulkMaxValue}
                  onChange={(e) => setBulkMaxValue(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {bulkClassId && bulkCourseId && students.length > 0 && (
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-3">Notes par élève :</h4>
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={bulkMaxValue}
                        step="0.5"
                        placeholder="Note"
                        value={studentGrades[student.id] || ''}
                        onChange={(e) => setStudentGrades({
                          ...studentGrades,
                          [student.id]: e.target.value
                        })}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkClassId && bulkCourseId && students.length === 0 && (
              <div className="text-sm text-red-600 text-center py-4">
                Aucun élève trouvé dans la base de données
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkClassId('');
                  setBulkCourseId('');
                  setStudentGrades({});
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={students.length === 0 || courses.length === 0}
              >
                Enregistrer les notes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement des données...</div>
      </div>
    );
  }

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cours / Matière
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {grades.length === 0 ? 'Aucune note enregistrée. Ajoutez votre première note !' : 'Aucune note ne correspond aux filtres sélectionnés'}
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => {
                  const student = getStudentInfo(grade.studentId);
                  const course = getCourseInfo(grade.courseId);
                  return (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student?.firstName} {student?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{course?.title}</div>
                        <div className="text-xs text-gray-500">{course?.subject}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
