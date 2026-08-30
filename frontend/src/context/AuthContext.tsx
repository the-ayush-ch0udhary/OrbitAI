import React, { createContext, useState, ReactNode } from 'react';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  login: (email: string, token: string, name?: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      if (token && email) {
        return { email, name: name || null };
      }
    } catch (e) {
      console.error('Error reading localStorage on init:', e);
    }
    return null;
  });

  const login = (email: string, token: string, name?: string | null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    if (name) {
      localStorage.setItem('userName', name);
    } else {
      localStorage.removeItem('userName');
    }
    setUser({ email, name: name || null });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};