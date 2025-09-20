import React from 'react';
import { Users, BookOpen, Calendar, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Élèves',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Enseignants',
      value: '87',
      change: '+3%',
      changeType: 'positive' as const,
      icon: BookOpen,
      color: 'green'
    },
    {
      title: 'Classes Actives',
      value: '34',
      change: '0%',
      changeType: 'neutral' as const,
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Revenus Mensuel',
      value: '€45,230',
      change: '+8%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'orange'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Nouvelle inscription', user: 'Marie Dupont', time: '2 min', type: 'success' },
    { id: 2, action: 'Absence signalée', user: 'Jean Martin', time: '15 min', type: 'warning' },
    { id: 3, action: 'Paiement reçu', user: 'Sophie Bernard', time: '1 h', type: 'success' },
    { id: 4, action: 'Cours annulé', user: 'Prof. Dubois', time: '2 h', type: 'error' },
    { id: 5, action: 'Note ajoutée', user: 'Prof. Morel', time: '3 h', type: 'info' }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
        <p className="text-gray-600">Aperçu de votre établissement scolaire</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Globale</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taux de Réussite</span>
              <span className="text-sm font-semibold text-gray-900">92.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '92.5%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taux de Présence</span>
              <span className="text-sm font-semibold text-gray-900">88.3%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88.3%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Satisfaction Parents</span>
              <span className="text-sm font-semibold text-gray-900">94.1%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94.1%' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
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
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nouvel Utilisateur</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nouveau Cours</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Planning</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertCircle className="h-8 w-8 text-orange-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Rapport</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;