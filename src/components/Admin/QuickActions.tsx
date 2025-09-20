import React, { useState } from 'react';
import { Users, BookOpen, Calendar, MessageSquare, CreditCard, FileText, Plus, TrendingUp, Bell, Settings } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  action: () => void;
}

const QuickActions: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'add-user',
      title: 'Nouvel Utilisateur',
      description: 'Ajouter un élève, enseignant ou parent',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'add-course',
      title: 'Nouveau Cours',
      description: 'Créer un nouveau cours ou matière',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'schedule',
      title: 'Emploi du Temps',
      description: 'Gérer les plannings et créneaux',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Envoyer des communications',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'payments',
      title: 'Paiements',
      description: 'Gérer la facturation et les paiements',
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'reports',
      title: 'Rapports',
      description: 'Générer des rapports et statistiques',
      icon: FileText,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'grades',
      title: 'Notes',
      description: 'Consulter et gérer les évaluations',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Envoyer des alertes et annonces',
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configurer l\'établissement',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      action: () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Nouvel élève inscrit', user: 'Marie Dupont', time: '5 min', type: 'success' },
    { id: 2, action: 'Note ajoutée', user: 'Prof. Martin', time: '15 min', type: 'info' },
    { id: 3, action: 'Paiement reçu', user: 'Parent Dubois', time: '1 h', type: 'success' },
    { id: 4, action: 'Absence signalée', user: 'Sophie Bernard', time: '2 h', type: 'warning' },
    { id: 5, action: 'Message envoyé', user: 'Admin', time: '3 h', type: 'info' }
  ];

  const pendingTasks = [
    { id: 1, task: 'Valider les inscriptions en attente', count: 5, priority: 'high' },
    { id: 2, task: 'Vérifier les paiements en retard', count: 12, priority: 'high' },
    { id: 3, task: 'Approuver les demandes de congé', count: 3, priority: 'medium' },
    { id: 4, task: 'Mettre à jour les emplois du temps', count: 2, priority: 'medium' },
    { id: 5, task: 'Préparer le rapport mensuel', count: 1, priority: 'low' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Actions Rapides</h1>
        <p className="text-gray-600">Accès direct aux fonctionnalités principales</p>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Action exécutée avec succès !
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
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

        {/* Pending Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tâches en Attente</h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500">
                      Priorité: {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {task.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu Statistiques</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Élèves Actifs</div>
            <div className="text-xs text-green-600">+5% ce mois</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">87</div>
            <div className="text-sm text-gray-600">Enseignants</div>
            <div className="text-xs text-green-600">+2 nouveaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">34</div>
            <div className="text-sm text-gray-600">Classes</div>
            <div className="text-xs text-gray-600">Stable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">92%</div>
            <div className="text-sm text-gray-600">Taux Présence</div>
            <div className="text-xs text-green-600">+1% ce mois</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;