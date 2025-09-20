import React from 'react';
import { Server, Database, Shield, Activity, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

const SystemOverview: React.FC = () => {
  const systemStats = [
    {
      title: 'Statut Serveur',
      value: 'En ligne',
      status: 'success',
      icon: Server,
      details: 'Temps de fonctionnement: 99.9%'
    },
    {
      title: 'Base de Données',
      value: 'Opérationnelle',
      status: 'success',
      icon: Database,
      details: 'Dernière sauvegarde: Il y a 2h'
    },
    {
      title: 'Sécurité',
      value: 'Sécurisé',
      status: 'success',
      icon: Shield,
      details: 'Aucune menace détectée'
    },
    {
      title: 'Performance',
      value: 'Optimale',
      status: 'warning',
      icon: Activity,
      details: 'Charge CPU: 65%'
    }
  ];

  const recentAlerts = [
    { id: 1, type: 'info', message: 'Sauvegarde automatique effectuée', time: '2h' },
    { id: 2, type: 'warning', message: 'Utilisation mémoire élevée (78%)', time: '4h' },
    { id: 3, type: 'success', message: 'Mise à jour sécurité installée', time: '1j' },
    { id: 4, type: 'info', message: 'Nouveau certificat SSL activé', time: '2j' }
  ];

  const userActivity = [
    { role: 'Administrateurs', online: 3, total: 5 },
    { role: 'Enseignants', online: 24, total: 87 },
    { role: 'Élèves', online: 156, total: 1247 },
    { role: 'Parents', online: 89, total: 892 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vue d'Ensemble Système</h1>
        <p className="text-gray-600">Surveillance et état de la plateforme</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getStatusColor(stat.status)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {getStatusIcon(stat.status)}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{stat.title}</h3>
              <p className="text-lg font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.details}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes Récentes</h3>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">Il y a {alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Utilisateurs</h3>
          <div className="space-y-4">
            {userActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{activity.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">{activity.online}</span>
                  <span className="text-sm text-gray-500">/ {activity.total}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(activity.online / activity.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques de Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.3s</div>
            <div className="text-sm text-gray-600 mb-2">Temps de Réponse Moyen</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600 mb-2">Disponibilité</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">1,247</div>
            <div className="text-sm text-gray-600 mb-2">Utilisateurs Actifs</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage & Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stockage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Base de données</span>
                <span className="text-sm text-gray-500">2.3 GB / 10 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fichiers</span>
                <span className="text-sm text-gray-500">5.7 GB / 20 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Sauvegardes</span>
                <span className="text-sm text-gray-500">1.2 GB / 5 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegardes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Sauvegarde Complète</p>
                <p className="text-xs text-gray-500">Aujourd'hui à 02:00</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Sauvegarde Incrémentale</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Prochaine Sauvegarde</p>
                <p className="text-xs text-gray-500">Dans 22 heures</p>
              </div>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;