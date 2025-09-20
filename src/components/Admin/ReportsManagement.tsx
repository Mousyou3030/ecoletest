import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, BookOpen, TrendingUp, PieChart, FileText } from 'lucide-react';

const ReportsManagement: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('academic');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reportTypes = [
    { id: 'academic', name: 'Rapport Académique', icon: BookOpen, description: 'Performances et notes des élèves' },
    { id: 'attendance', name: 'Rapport de Présence', icon: Users, description: 'Statistiques de présence par classe' },
    { id: 'financial', name: 'Rapport Financier', icon: TrendingUp, description: 'Revenus et paiements' },
    { id: 'enrollment', name: 'Rapport d\'Inscription', icon: FileText, description: 'Évolution des inscriptions' }
  ];

  // Mock data for charts
  const academicData = {
    averageGrades: [
      { subject: 'Mathématiques', average: 14.2, students: 120 },
      { subject: 'Français', average: 13.8, students: 120 },
      { subject: 'Histoire', average: 15.1, students: 120 },
      { subject: 'Anglais', average: 13.5, students: 120 },
      { subject: 'Sciences', average: 14.7, students: 120 }
    ],
    classPerformance: [
      { class: '6ème A', average: 14.5, students: 28 },
      { class: '6ème B', average: 13.9, students: 26 },
      { class: '3ème A', average: 15.2, students: 24 },
      { class: '3ème B', average: 14.1, students: 25 }
    ]
  };

  const attendanceData = {
    monthly: [
      { month: 'Jan', rate: 94 },
      { month: 'Fév', rate: 92 },
      { month: 'Mar', rate: 96 },
      { month: 'Avr', rate: 93 },
      { month: 'Mai', rate: 95 }
    ],
    byClass: [
      { class: '6ème A', rate: 95, absences: 12 },
      { class: '6ème B', rate: 92, absences: 18 },
      { class: '3ème A', rate: 97, absences: 8 },
      { class: '3ème B', rate: 94, absences: 14 }
    ]
  };

  const financialData = {
    revenue: [
      { month: 'Jan', amount: 45230 },
      { month: 'Fév', amount: 48150 },
      { month: 'Mar', amount: 46890 },
      { month: 'Avr', amount: 49200 },
      { month: 'Mai', amount: 47650 }
    ],
    breakdown: [
      { type: 'Scolarité', amount: 180000, percentage: 75 },
      { type: 'Cantine', amount: 36000, percentage: 15 },
      { type: 'Transport', amount: 18000, percentage: 7.5 },
      { type: 'Matériel', amount: 6000, percentage: 2.5 }
    ]
  };

  const AcademicReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Grades by Subject */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par Matière</h3>
          <div className="space-y-4">
            {academicData.averageGrades.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                    <span className="text-sm font-bold text-gray-900">{subject.average}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        subject.average >= 15 ? 'bg-green-500' :
                        subject.average >= 12 ? 'bg-blue-500' :
                        subject.average >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(subject.average / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{subject.students} élèves</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Classe</h3>
          <div className="space-y-4">
            {academicData.classPerformance.map((cls, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cls.class}</p>
                  <p className="text-sm text-gray-500">{cls.students} élèves</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    cls.average >= 15 ? 'text-green-600' :
                    cls.average >= 12 ? 'text-blue-600' :
                    cls.average >= 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {cls.average}/20
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moyenne Générale</p>
              <p className="text-2xl font-bold text-gray-900">14.3/20</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Élèves Évalués</p>
              <p className="text-2xl font-bold text-gray-900">120</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notes Saisies</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AttendanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution Mensuelle</h3>
          <div className="space-y-4">
            {attendanceData.monthly.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        month.rate >= 95 ? 'bg-green-500' :
                        month.rate >= 90 ? 'bg-blue-500' :
                        month.rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${month.rate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{month.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance by Class */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Présence par Classe</h3>
          <div className="space-y-4">
            {attendanceData.byClass.map((cls, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cls.class}</p>
                  <p className="text-sm text-gray-500">{cls.absences} absences</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    cls.rate >= 95 ? 'text-green-600' :
                    cls.rate >= 90 ? 'text-blue-600' :
                    cls.rate >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {cls.rate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const FinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Evolution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus</h3>
          <div className="space-y-4">
            {financialData.revenue.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(month.amount / 50000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">€{month.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Revenus</h3>
          <div className="space-y-4">
            {financialData.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.type}</p>
                  <p className="text-sm text-gray-500">{item.percentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    €{item.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'academic':
        return <AcademicReport />;
      case 'attendance':
        return <AttendanceReport />;
      case 'financial':
        return <FinancialReport />;
      case 'enrollment':
        return (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport d'Inscription</h3>
            <p className="text-gray-600">Les données d'inscription seront disponibles prochainement.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Analyses</h1>
          <p className="text-gray-600">Consultez les statistiques et performances de votre établissement</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <Icon className={`h-6 w-6 mr-2 ${
                  selectedReport === report.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h3 className={`font-medium ${
                  selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {report.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default ReportsManagement;