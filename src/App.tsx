import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import ParentDashboard from './components/Dashboard/ParentDashboard';
import UserManagement from './components/Admin/UserManagement';
import ClassManagement from './components/Admin/ClassManagement';
import CourseManagement from './components/Admin/CourseManagement';
import ScheduleManagement from './components/Admin/ScheduleManagement';
import AttendanceManagement from './components/Admin/AttendanceManagement';
import MessageCenter from './components/Admin/MessageCenter';
import FinanceManagement from './components/Admin/FinanceManagement';
import ReportsManagement from './components/Admin/ReportsManagement';
import SettingsManagement from './components/Admin/SettingsManagement';
import GradeManagement from './components/Admin/GradeManagement';
import QuickActions from './components/Admin/QuickActions';
import SystemOverview from './components/Admin/SystemOverview';
import ParentChildManagement from './components/Admin/ParentChildManagement';
import MyClasses from './components/Teacher/MyClasses';
import TeacherGradeManagement from './components/Teacher/GradeManagement';
import MyCourses from './components/Teacher/MyCourses';
import MySchedule from './components/Teacher/MySchedule';
import TeacherAttendance from './components/Teacher/TeacherAttendance';
import TeacherMessages from './components/Teacher/TeacherMessages';
import TeacherReports from './components/Teacher/TeacherReports';
import StudentCourses from './components/Student/MyCourses';
import StudentSchedule from './components/Student/MySchedule';
import StudentGrades from './components/Student/MyGrades';
import StudentAttendance from './components/Student/MyAttendance';
import StudentMessages from './components/Student/MyMessages';
import StudentNotifications from './components/Student/MyNotifications';
import MyChildren from './components/Parent/MyChildren';
import ChildrenGrades from './components/Parent/ChildrenGrades';
import ChildrenAttendance from './components/Parent/ChildrenAttendance';
import ChildrenSchedule from './components/Parent/ChildrenSchedule';
import ParentMessages from './components/Parent/ParentMessages';
import ParentFinances from './components/Parent/ParentFinances';
import LoadingSpinner from './components/Common/LoadingSpinner';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (activeSection === 'dashboard') {
      switch (user.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'teacher':
          return <TeacherDashboard />;
        case 'student':
          return <StudentDashboard />;
        case 'parent':
          return <ParentDashboard />;
        default:
          return <div>Rôle non reconnu</div>;
      }
    }

    if (user.role === 'admin') {
      switch (activeSection) {
        case 'users':
          return <UserManagement />;
        case 'classes':
          return <ClassManagement />;
        case 'courses':
          return <CourseManagement />;
        case 'schedule':
          return <ScheduleManagement />;
        case 'attendance':
          return <AttendanceManagement />;
        case 'messages':
          return <MessageCenter />;
        case 'finances':
          return <FinanceManagement />;
        case 'reports':
          return <ReportsManagement />;
        case 'settings':
          return <SettingsManagement />;
        case 'grades':
          return <GradeManagement />;
        case 'quick-actions':
          return <QuickActions />;
        case 'system':
          return <SystemOverview />;
        case 'parent-children':
          return <ParentChildManagement />;
      }
    }

    if (user.role === 'teacher') {
      switch (activeSection) {
        case 'classes':
          return <MyClasses />;
        case 'courses':
          return <MyCourses />;
        case 'schedule':
          return <MySchedule />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'messages':
          return <TeacherMessages />;
        case 'reports':
          return <TeacherReports />;
        case 'grades':
          return <TeacherGradeManagement />;
      }
    }

    if (user.role === 'student') {
      switch (activeSection) {
        case 'courses':
          return <StudentCourses />;
        case 'schedule':
          return <StudentSchedule />;
        case 'grades':
          return <StudentGrades />;
        case 'attendance':
          return <StudentAttendance />;
        case 'messages':
          return <StudentMessages />;
        case 'notifications':
          return <StudentNotifications />;
      }
    }

    if (user.role === 'parent') {
      switch (activeSection) {
        case 'children':
          return <MyChildren />;
        case 'grades':
          return <ChildrenGrades />;
        case 'attendance':
          return <ChildrenAttendance />;
        case 'schedule':
          return <ChildrenSchedule />;
        case 'messages':
          return <ParentMessages />;
        case 'finances':
          return <ParentFinances />;
      }
    }

    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
          {activeSection.replace('-', ' ')}
        </h2>
        <p className="text-gray-600">
          Cette section est en cours de développement. Elle sera bientôt disponible avec toutes les fonctionnalités avancées de gestion scolaire.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Fonctionnalités à venir</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Interface complète de gestion</li>
              <li>• Synchronisation en temps réel</li>
              <li>• Rapports détaillés</li>
            </ul>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Intégrations</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• APIs externes</li>
              <li>• Systèmes de paiement</li>
              <li>• Outils de communication</li>
            </ul>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Sécurité</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Conformité RGPD</li>
              <li>• Chiffrement des données</li>
              <li>• Contrôle d'accès avancé</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar
          userRole={user.role}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
