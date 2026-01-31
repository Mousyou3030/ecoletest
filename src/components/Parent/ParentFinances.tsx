import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Download, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

const ParentFinances: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const childrenResponse = await axios.get(`${API_BASE_URL}/parent-children/parent/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(childrenResponse.data);

      const childIds = childrenResponse.data.map((c: Child) => c.id);
      const paymentsPromises = childIds.map((childId: string) =>
        axios.get(`${API_BASE_URL}/payments/student/${childId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      );

      const paymentsResponses = await Promise.all(paymentsPromises);
      const allPayments = paymentsResponses.flatMap((response, index) =>
        response.data.map((payment: any) => ({
          ...payment,
          studentId: childIds[index],
          studentName: `${childrenResponse.data[index].firstName} ${childrenResponse.data[index].lastName}`
        }))
      );

      setPayments(allPayments);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const overdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    return { total, paid, pending, overdue };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
        <p className="text-gray-600">Gestion des paiements scolaires</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun enfant associé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <DollarSign className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-blue-100 text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-green-100 text-sm">Payé</p>
                  <p className="text-2xl font-bold">{stats.paid.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-orange-100 text-sm">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-red-100 text-sm">En retard</p>
                  <p className="text-2xl font-bold">{stats.overdue.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Historique des paiements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Élève</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date limite</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Aucun paiement enregistré
                      </td>
                    </tr>
                  ) : (
                    payments
                      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                      .map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">{payment.studentName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {payment.description}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            {payment.amount.toFixed(2)} €
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              {getStatusIcon(payment.status)}
                              <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
                                {getStatusLabel(payment.status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {payment.status === 'paid' ? (
                              <button className="text-blue-600 hover:text-blue-800">
                                <Download className="h-4 w-4" />
                              </button>
                            ) : (
                              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                <CreditCard className="h-4 w-4 inline mr-1" />
                                Payer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentFinances;
