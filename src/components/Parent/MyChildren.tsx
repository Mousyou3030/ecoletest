import React, { useState, useEffect } from 'react';
import { User, TrendingUp, Calendar, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  relationship: string;
}

const MyChildren: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildren();
  }, [user?.id]);

  const fetchChildren = async () => {
    if (!user?.id) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/parent-children/parent/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChildren(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des enfants:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Enfants</h1>
        <p className="text-gray-600">Informations sur vos enfants scolarisés</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun enfant associé</h3>
          <p className="text-gray-600">Contactez l'administration pour associer vos enfants à votre compte</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <div key={child.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {child.firstName} {child.lastName}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mt-1">
                    {child.relationship}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-sm">{child.email}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-sm">
                    {new Date(child.dateOfBirth).toLocaleDateString('fr-FR')} ({calculateAge(child.dateOfBirth)} ans)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-gray-200">
                <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
                  <span className="text-xs font-medium text-green-700">Notes</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-blue-700">Planning</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Phone className="h-5 w-5 text-purple-600 mb-1" />
                  <span className="text-xs font-medium text-purple-700">Contact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChildren;
