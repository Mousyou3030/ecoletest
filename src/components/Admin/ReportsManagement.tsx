import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Users, BookOpen, TrendingUp, PieChart, FileText } from 'lucide-react';
import { reportService, classService, courseService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const ReportsManagement: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('academic');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    classId: '',
    courseId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const reportTypes = [
    { id: 'academic', name: 'Rapport Académique', icon: BookOpen, description: 'Performances et notes des élèves' },
    { id: 'attendance', name: 'Rapport de Présence', icon: Users, description: 'Statistiques de présence par classe' },
    { id: 'financial', name: 'Rapport Financier', icon: TrendingUp, description: 'Revenus et paiements' },
    { id: 'enrollment', name: 'Rapport d\'Inscription', icon: FileText, description: 'Évolution des inscriptions' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, filters]);

  const fetchInitialData = async () => {
    try {
      const [classesData, coursesData] = await Promise.all([
        classService.getAll(),
        courseService.getAll()
      ]);
      setClasses(classesData.classes || classesData || []);
      setCourses(coursesData.courses || coursesData || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (selectedReport) {
        case 'academic':
          const academicResult = await reportService.getAcademic(filters);
          setAcademicData(academicResult);
          break;
        case 'attendance':
          const attendanceResult = await reportService.getAttendance(filters);
          setAttendanceData(attendanceResult);
          break;
        case 'financial':
          const financialResult = await reportService.getFinancial(filters);
          setFinancialData(financialResult);
          break;
        case 'enrollment':
          const enrollmentResult = await reportService.getEnrollment();
          setEnrollmentData(enrollmentResult);
          break;
      }
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const AcademicReport = () => {
    if (!academicData) return <div className="text-center py-8">Aucune donnée disponible</div>;

    return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Grades by Subject */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Académique</h3>
          <div className="space-y-4">
            {academicData.summary && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Étudiants</p>
                    <p className="text-2xl font-bold text-blue-600">{academicData.summary.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Moyenne Générale</p>
                    <p className="text-2xl font-bold text-blue-600">{academicData.summary.overallAverage?.toFixed(2)}/20</p>
                  </div>
                </div>
              </div>
            )}
            {(academicData.details || []).slice(0, 5).map((detail: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{detail.student_name} - {detail.course_name}</span>
                    <span className="text-sm font-bold text-gray-900">{parseFloat(detail.average_grade)?.toFixed(2)}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        detail.average_grade >= 15 ? 'bg-green-500' :
                        detail.average_grade >= 12 ? 'bg-blue-500' :
                        detail.average_grade >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(detail.average_grade / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{detail.class_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
  };

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