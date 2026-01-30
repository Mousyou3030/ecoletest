import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Users, UserPlus } from 'lucide-react';
import { userService } from '../../services/api';
import axios from 'axios';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ParentChild {
  id: string;
  parentId: string;
  childId: string;
  relationship: string;
  parentName: string;
  childName: string;
}

const ParentChildManagement: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [relationships, setRelationships] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersResponse = await userService.getAll();
      const allUsers = usersResponse.users || usersResponse;

      setParents(allUsers.filter((u: any) => u.role === 'parent'));
      setStudents(allUsers.filter((u: any) => u.role === 'student'));

      await fetchRelationships();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const fetchRelationships = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/parent-children`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRelationships(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des relations:', error);
      setRelationships([]);
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        parentId: formData.get('parentId') as string,
        childId: formData.get('childId') as string,
        relationship: formData.get('relationship') as string
      };

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      await axios.post(`${API_BASE_URL}/parent-children`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchRelationships();
      setShowAddModal(false);
      alert('Relation parent-enfant créée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création de la relation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette relation ?')) {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      await axios.delete(`${API_BASE_URL}/parent-children/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchRelationships();
      alert('Relation supprimée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const filteredRelationships = relationships.filter(rel =>
    rel.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.childName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AddRelationshipModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Lier un parent à un élève</h3>
          <form onSubmit={handleAddRelationship} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <select
                name="parentId"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Sélectionner un parent</option>
                {parents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.firstName} {parent.lastName} ({parent.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
              <select
                name="childId"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Sélectionner un élève</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
              <select
                name="relationship"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Sélectionner une relation</option>
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Tuteur">Tuteur</option>
                <option value="Tutrice">Tutrice</option>
                <option value="Grand-père">Grand-père</option>
                <option value="Grand-mère">Grand-mère</option>
                <option value="Autre">Autre</option>
              </select>
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
                {loading ? 'Création...' : 'Créer la relation'}
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
          <h1 className="text-2xl font-bold text-gray-900">Relations Parents-Enfants</h1>
          <p className="text-gray-600">Gérez les liens entre parents et élèves</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle relation
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher par nom de parent ou d'élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Total Relations</p>
              <p className="text-3xl font-bold">{relationships.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Parents</p>
              <p className="text-3xl font-bold">{parents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-3" />
            <div>
              <p className="text-purple-100">Élèves</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Parent</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Élève</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Relation</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRelationships.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Aucune relation trouvée
                  </td>
                </tr>
              ) : (
                filteredRelationships.map(rel => (
                  <tr key={rel.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{rel.parentName}</p>
                        <p className="text-sm text-gray-500">Parent</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{rel.childName}</p>
                        <p className="text-sm text-gray-500">Élève</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {rel.relationship}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteRelationship(rel.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <AddRelationshipModal />}
    </div>
  );
};

export default ParentChildManagement;
