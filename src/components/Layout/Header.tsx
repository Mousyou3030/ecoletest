import React, { useState } from 'react';
import { Bell, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: '1', title: 'Nouveau message', message: 'Vous avez reçu un nouveau message de M. Martin', time: '5 min' },
    { id: '2', title: 'Note ajoutée', message: 'Une nouvelle note a été ajoutée en Mathématiques', time: '1h' },
    { id: '3', title: 'Rendez-vous', message: 'Rendez-vous parent-professeur demain à 14h', time: '2h' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        </div>
                        <span className="text-gray-400 text-xs">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 text-center border-t border-gray-200">
                  <button className="text-blue-600 text-sm hover:text-blue-800">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'Administrateur' : 
                   user?.role === 'teacher' ? 'Enseignant' :
                   user?.role === 'student' ? 'Élève' : 'Parent'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <button className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <User className="h-4 w-4 mr-3" />
                    Mon Profil
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="h-4 w-4 mr-3" />
                    Paramètres
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;