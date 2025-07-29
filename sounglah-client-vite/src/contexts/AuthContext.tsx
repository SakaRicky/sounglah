import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, validateToken as apiValidateToken } from '@/api/auth';
import type { AxiosError } from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleTokenExpiration = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const validateToken = useCallback(async () => {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiValidateToken();
      if (response.valid) {
        setToken(savedToken);
        setUser(response.user);
      } else {
        handleTokenExpiration();
      }
    } catch {
      handleTokenExpiration();
    }
  }, [handleTokenExpiration]);

  const startTokenValidation = useCallback(() => {
    if (token) {
      const interval = setInterval(validateToken, 5 * 60 * 1000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [token, validateToken]);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        setLoading(false);
        // Start periodic validation
        startTokenValidation();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [startTokenValidation]);

  // Listen for token expiration events from API calls
  useEffect(() => {
    const handleTokenExpired = () => {
      handleTokenExpiration();
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => window.removeEventListener('tokenExpired', handleTokenExpired);
  }, [handleTokenExpiration]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin(username, password);
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      
      // Start periodic validation after successful login
      startTokenValidation();
      
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error: string }>;
      if (axiosError?.response && axiosError.response.data?.error) {
        console.error('Login failed:', axiosError.response.data.error);
      } else {
        console.error('Login error:', error);
      }
      return false;
    }
  }, [startTokenValidation]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
    navigate('/login');
  }, [navigate]);

  const value: AuthContextType = {
    token,
    user,
    loading,
    isAuthenticated: !!token, // Determine if authenticated based on token existence
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 