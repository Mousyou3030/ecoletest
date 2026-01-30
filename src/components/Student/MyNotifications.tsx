import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const MyNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Nouveau cours ajouté',
      message: 'Un nouveau cours de Mathématiques a été ajouté à votre emploi du temps.',
      date: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Note publiée',
      message: 'Votre note de Français a été publiée: 16/20',
      date: new Date(Date.now() - 86400000).toISOString(),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Devoir à rendre',
      message: 'N\'oubliez pas de rendre votre devoir d\'Histoire avant vendredi.',
      date: new Date(Date.now() - 172800000).toISOString(),
      read: true
    }
  ]);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes vos notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <Bell className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Total</p>
              <p className="text-3xl font-bold">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Non lues</p>
              <p className="text-3xl font-bold">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Lues</p>
              <p className="text-3xl font-bold">{notifications.length - unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune notification</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white p-6 rounded-lg shadow-sm border ${
                !notification.read ? getNotificationColor(notification.type) : 'border-gray-200'
              } transition-all`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </h3>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(notification.date)}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyNotifications;
