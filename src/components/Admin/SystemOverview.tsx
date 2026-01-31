import React, { useState, useEffect } from 'react';
import { Server, Database, Shield, Activity, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { systemService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const SystemOverview: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();

    const interval = setInterval(fetchSystemData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [status, activity, systemLogs] = await Promise.all([
        systemService.getStatus(),
        systemService.getUsersActivity(),
        systemService.getLogs({ limit: 10 })
      ]);

      setSystemStatus(status);
      setUserActivity(activity);
      setLogs(systemLogs);
    } catch (err: any) {
      console.error('Error fetching system data:', err);
      setError('Erreur lors du chargement des données système');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !systemStatus) {
    return <LoadingSpinner />;
  }

  if (error && !systemStatus) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchSystemData}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const systemStats = [
    {
      title: 'Statut Serveur',
      value: systemStatus?.server?.status === 'operational' ? 'En ligne' : 'Hors ligne',
      status: systemStatus?.server?.status === 'operational' ? 'success' : 'error',
      icon: Server,
      details: systemStatus?.server?.uptimeFormatted ? `Temps de fonctionnement: ${systemStatus.server.uptimeFormatted}` : 'N/A'
    },
    {
      title: 'Base de Données',
      value: systemStatus?.database?.status === 'connected' ? 'Opérationnelle' : 'Déconnectée',
      status: systemStatus?.database?.status === 'connected' ? 'success' : 'error',
      icon: Database,
      details: systemStatus?.database?.type || 'MySQL'
    },
    {
      title: 'Mémoire',
      value: `${systemStatus?.memory?.usagePercent || 0}%`,
      status: (systemStatus?.memory?.usagePercent || 0) > 80 ? 'warning' : 'success',
      icon: Shield,
      details: `${Math.round((systemStatus?.memory?.used || 0) / 1024 / 1024 / 1024)}GB / ${Math.round((systemStatus?.memory?.total || 0) / 1024 / 1024 / 1024)}GB`
    },
    {
      title: 'Performance',
      value: systemStatus?.cpu?.cores ? `${systemStatus.cpu.cores} cores` : 'N/A',
      status: 'success',
      icon: Activity,
      details: `Charge: ${systemStatus?.cpu?.loadAverage?.[0]?.toFixed(2) || 'N/A'}`
    }
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
        {/* Recent Alerts / Logs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs Récents</h3>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun log disponible</p>
            ) : (
              logs.slice(0, 10).map((log: any) => (
                <div key={log.id} className="flex items-start space-x-3">
                  {getAlertIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{log.message}</p>
                    <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Utilisateurs</h3>
          <div className="space-y-4">
            {userActivity?.summary && (
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">24h</p>
                  <p className="text-lg font-bold text-blue-600">{userActivity.summary.last_24h}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">7 jours</p>
                  <p className="text-lg font-bold text-blue-600">{userActivity.summary.last_7days}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">30 jours</p>
                  <p className="text-lg font-bold text-blue-600">{userActivity.summary.last_30days}</p>
                </div>
              </div>
            )}
            {(userActivity?.byRole || []).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 capitalize">{activity.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">{activity.active_users}</span>
                  <span className="text-sm text-gray-500">/ {activity.total_users}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${activity.total_users > 0 ? (activity.active_users / activity.total_users) * 100 : 0}%` }}
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