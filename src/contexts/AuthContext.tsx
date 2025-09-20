import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock users for demo
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@school.edu',
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'admin',
      createdAt: new Date(),
    },
    {
      id: '2',
      email: 'teacher@school.edu',
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'teacher',
      createdAt: new Date(),
    },
    {
      id: '3',
      email: 'student@school.edu',
      firstName: 'Sophie',
      lastName: 'Dupont',
      role: 'student',
      createdAt: new Date(),
    },
    {
      id: '4',
      email: 'parent@school.edu',
      firstName: 'Pierre',
      lastName: 'Dupont',
      role: 'parent',
      createdAt: new Date(),
    }
  ];

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Mock authentication - in production, this would be a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } else {
      throw new Error('Identifiants invalides');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};