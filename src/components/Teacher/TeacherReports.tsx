import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, BookOpen, TrendingUp, PieChart, FileText } from 'lucide-react';

const TeacherReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('grades');
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reportTypes = [
    { id: 'grades', name: 'Rapport de Notes', icon: BookOpen, description: 'Analyse des performances de vos élèves' },
    { id: 'attendance', name: 'Rapport de Présence', icon: Users, description: 'Statistiques de présence par classe' },
    { id: 'progress', name: 'Suivi des Progrès', icon: TrendingUp, description: 'Évolution des élèves dans le temps' },
    { id: 'behavior', name: 'Rapport Comportement', icon: FileText, description: 'Évaluation du comportement en classe' }
  ];

  const classes = [
    { id: '1', name: '6ème A' },
    { id: '2', name: '6ème B' },
    { id: '3', name: '3ème A' }
  ];

  // Mock data for reports
  const gradesData = {
    classAverage: 14.2,
    studentGrades: [
      { name: 'Sophie Dupont', average: 16.5, trend: 'up' },
      { name: 'Lucas Martin', average: 12.8, trend: 'stable' },
      { name: 'Emma Bernard', average: 18.2, trend: 'up' },
      { name: 'Thomas Dubois', average: 13.5, trend: 'down' }
    ],
    subjectBreakdown: [
      { subject: 'Algèbre', average: 15.1 },
      { subject: 'Géométrie', average: 13.8 },
      { subject: 'Calcul', average: 14.5 }
    ]
  };

  const attendanceData = {
    classRate: 94.5,
    studentAttendance: [
      { name: 'Sophie Dupont', rate: 98, absences: 2 },
      { name: 'Lucas Martin', rate: 89, absences: 8 },
      { name: 'Emma Bernard', rate: 100, absences: 0 },
      { name: 'Thomas Dubois', rate: 92, absences: 6 }
    ],
    monthlyTrend: [
      { month: 'Sep', rate: 96 },
      { month: 'Oct', rate: 94 },
      { month: 'Nov', rate: 95 },
      { month: 'Dec', rate: 93 },
      { month: 'Jan', rate: 95 }
    ]
  };

  const GradesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Average */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyenne de Classe</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {gradesData.classAverage}/20
            </div>
            <p className="text-gray-600">Moyenne générale</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${(gradesData.classAverage / 20) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par Chapitre</h3>
          <div className="space-y-4">
            {gradesData.subjectBreakdown.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        subject.average >= 15 ? 'bg-green-500' :
                        subject.average >= 12 ? 'bg-blue-500' :
                        subject.average >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(subject.average / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{subject.average}/20</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Élève</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moyenne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évaluation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradesData.studentGrades.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${
                      student.average >= 16 ? 'text-green-600' :
                      student.average >= 12 ? 'text-blue-600' :
                      student.average >= 10 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {student.average}/20
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      student.trend === 'up' ? 'bg-green-100 text-green-800' :
                      student.trend === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.trend === 'up' ? '↗ En progression' :
                       student.trend === 'down' ? '↘ En baisse' : '→ Stable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.average >= 16 ? 'Excellent' :
                     student.average >= 14 ? 'Très bien' :
                     student.average >= 12 ? 'Bien' :
                     student.average >= 10 ? 'Assez bien' : 'Insuffisant'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AttendanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Attendance Rate */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Présence Classe</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {attendanceData.classRate}%
            </div>
            <p className="text-gray-600">Présence moyenne</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${attendanceData.classRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution Mensuelle</h3>
          <div className="space-y-3">
            {attendanceData.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
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
      </div>

      {/* Student Attendance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Présence par Élève</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de présence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absences
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.studentAttendance.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            student.rate >= 95 ? 'bg-green-500' :
                            student.rate >= 90 ? 'bg-blue-500' :
                            student.rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{student.rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.absences} jours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.rate >= 95 ? 'bg-green-100 text-green-800' :
                      student.rate >= 90 ? 'bg-blue-100 text-blue-800' :
                      student.rate >= 85 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.rate >= 95 ? 'Excellent' :
                       student.rate >= 90 ? 'Bien' :
                       student.rate >= 85 ? 'Moyen' : 'Préoccupant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'grades':
        return <GradesReport />;
      case 'attendance':
        return <AttendanceReport />;
      case 'progress':
        return (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Suivi des Progrès</h3>
            <p className="text-gray-600">Les données de progression seront disponibles prochainement.</p>
          </div>
        );
      case 'behavior':
        return (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport Comportement</h3>
            <p className="text-gray-600">Les évaluations comportementales seront disponibles prochainement.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Mes Rapports</h1>
          <p className="text-gray-600">Analysez les performances et le suivi de vos classes</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
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

export default TeacherReports;