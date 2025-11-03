import React, { useState, useEffect } from 'react';
import { User, TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface ParentData {
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    className: string;
  }>;
  unpaidInvoices: number;
  upcomingEvents: any[];
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const dashboardData = await dashboardService.getParentDashboard(user.id);
        setData(dashboardData);
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div className="text-gray-600">Aucune donnée disponible</div>;

  const children = data.children.map((child, index) => ({
    id: child.id,
    name: `${child.firstName} ${child.lastName}`,
    class: child.className,
    average: 15.2 + Math.random() * 4,
    attendance: 90 + Math.random() * 8,
    nextClass: { subject: 'Mathématiques', time: '10:00', room: 'Salle 101' }
  }));

  const recentEvents = [
    { type: 'grade', child: children[0]?.name.split(' ')[0] || 'Élève', message: 'Nouvelle note en Mathématiques: 16/20', time: '2h' },
    { type: 'absence', child: children[1]?.name.split(' ')[0] || 'Élève', message: 'Absence signalée en Histoire', time: '1 jour' },
    { type: 'payment', child: children[0]?.name.split(' ')[0] || 'Élève', message: 'Paiement cantine effectué', time: '2 jours' },
    { type: 'meeting', child: children[1]?.name.split(' ')[0] || 'Élève', message: 'Rendez-vous parent-prof programmé', time: '3 jours' }
  ];

  const upcomingEvents = [
    { date: '22/01', event: 'Réunion parents-professeurs', child: children[0]?.name.split(' ')[0] || 'Élève' },
    { date: '25/01', event: 'Contrôle de Mathématiques', child: children[1]?.name.split(' ')[0] || 'Élève' },
    { date: '28/01', event: 'Sortie scolaire au musée', child: children[0]?.name.split(' ')[0] || 'Élève' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Parent</h1>
        <p className="text-gray-600">Suivi de la scolarité de vos enfants</p>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <div key={child.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-500">{child.class}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Moyenne</span>
                </div>
                <p className="text-lg font-bold text-green-700">{child.average}/20</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-600">Présence</span>
                </div>
                <p className="text-lg font-bold text-blue-700">{child.attendance}%</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4 mr-1" />
                Prochain cours
              </div>
              <p className="font-medium text-gray-900">
                {child.nextClass.subject} à {child.nextClass.time}
              </p>
              <p className="text-sm text-gray-500">{child.nextClass.room}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'grade' ? 'bg-green-500' :
                  event.type === 'absence' ? 'bg-red-500' :
                  event.type === 'payment' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {event.child} - {event.message}
                  </p>
                  <p className="text-xs text-gray-500">Il y a {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Événements à Venir</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-500">{event.child}</p>
                </div>
                <span className="text-sm font-medium text-gray-700">{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Voir Notes</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Planning</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Présences</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Contacter École</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;