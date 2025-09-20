import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const demoAccounts = [
    { email: 'admin@school.edu', role: 'Administrateur', desc: 'Accès complet à la gestion' },
    { email: 'teacher@school.edu', role: 'Enseignant', desc: 'Gestion des cours et notes' },
    { email: 'student@school.edu', role: 'Élève', desc: 'Consultation des cours et notes' },
    { email: 'parent@school.edu', role: 'Parent', desc: 'Suivi de la scolarité' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Welcome */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <GraduationCap className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">MyScol</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Plateforme de Gestion Scolaire
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Simplifiez la gestion de votre établissement avec notre solution tout-en-un.
              Gestion des élèves, des notes, des emplois du temps et bien plus encore.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Comptes de démonstration :</h3>
              <div className="grid gap-3">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(account.email)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">
                          {account.role}
                        </p>
                        <p className="text-sm text-gray-500">{account.desc}</p>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {account.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="text-center mb-8">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Connexion</h3>
                <p className="text-gray-600 mt-2">Accédez à votre espace personnel</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Mot de passe oublié ?{' '}
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Réinitialiser
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;