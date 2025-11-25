/**
 * Authentication Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, signup, getCurrentUser } from '../services/api';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Verify token and get user
          const userData = await getCurrentUser(storedToken);
          setUser(userData.user);
          const { setAuthToken } = await import('../services/api');
          setAuthToken(storedToken);
        } catch (error) {
          // Token invalid, clear it
          await AsyncStorage.removeItem('authToken');
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await login(email, password);
    setUser(response.user);
    setToken(response.token);
    await AsyncStorage.setItem('authToken', response.token);
    const { setAuthToken } = await import('../services/api');
    setAuthToken(response.token);
  };

  const handleSignup = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) => {
    const response = await signup(email, password, firstName, lastName, username);
    setUser(response.user);
    setToken(response.token);
    await AsyncStorage.setItem('authToken', response.token);
    const { setAuthToken } = await import('../services/api');
    setAuthToken(response.token);
  };

  const handleLogout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('authToken');
    const { setAuthToken } = await import('../services/api');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

