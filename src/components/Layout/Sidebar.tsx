import React from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  GraduationCap,
  ClipboardList,
  Bell,
  FileText,
  CreditCard,
  Zap,
  Monitor
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, activeSection, onSectionChange }) => {
  const getMenuItems = (role: UserRole) => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: Home }
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'classes', label: 'Classes', icon: GraduationCap },
          { id: 'courses', label: 'Cours', icon: BookOpen },
          { id: 'schedule', label: 'Emplois du temps', icon: Calendar },
          { id: 'grades', label: 'Notes', icon: ClipboardList },
          { id: 'attendance', label: 'Présences', icon: FileText },
          { id: 'parent-children', label: 'Parents-Enfants', icon: Users },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'finances', label: 'Finances', icon: CreditCard },
          { id: 'reports', label: 'Rapports', icon: BarChart3 },
          { id: 'settings', label: 'Paramètres', icon: Settings },
          { id: 'quick-actions', label: 'Actions Rapides', icon: Zap },
          { id: 'system', label: 'Système', icon: Monitor }
        ];
      case 'teacher':
        return [
          ...baseItems,
          { id: 'classes', label: 'Mes Classes', icon: GraduationCap },
          { id: 'courses', label: 'Mes Cours', icon: BookOpen },
          { id: 'schedule', label: 'Mon Planning', icon: Calendar },
          { id: 'grades', label: 'Notes', icon: ClipboardList },
          { id: 'attendance', label: 'Présences', icon: FileText },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'reports', label: 'Rapports', icon: BarChart3 }
        ];
      case 'student':
        return [
          ...baseItems,
          { id: 'courses', label: 'Mes Cours', icon: BookOpen },
          { id: 'schedule', label: 'Mon Planning', icon: Calendar },
          { id: 'grades', label: 'Mes Notes', icon: ClipboardList },
          { id: 'attendance', label: 'Mes Présences', icon: FileText },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ];
      case 'parent':
        return [
          ...baseItems,
          { id: 'children', label: 'Mes Enfants', icon: Users },
          { id: 'grades', label: 'Notes', icon: ClipboardList },
          { id: 'attendance', label: 'Présences', icon: FileText },
          { id: 'schedule', label: 'Planning', icon: Calendar },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'finances', label: 'Finances', icon: CreditCard }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems(userRole);

  return (
    <div className="w-64 bg-white shadow-lg h-full border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">MyScol</span>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
