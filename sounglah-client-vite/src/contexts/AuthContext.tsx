import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, validateToken as apiValidateToken } from '@/api/auth';
import type { LoginResponse } from '@/api/auth';
import type { AxiosError } from 'axios';
import { useNotification } from './NotificationContext';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
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

// Inner component that uses useNavigate (must be inside Router)
const AuthProviderInner: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to validate token using the API
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      await apiValidateToken();
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return false;
      }
      // For other errors, we'll assume the token is still valid
      return true;
    }
  }, []);

  // Function to handle token expiration
  const handleTokenExpiration = useCallback(() => {
    console.log('Token expired, logging out user');
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear validation interval
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }
    
    // Show notification to user
    notify({
      type: 'warning',
      title: 'Session Expired',
      detail: 'Your session has expired. Please log in again to continue.',
      duration: 5000
    });
    
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [navigate, notify]);

  // Function to start periodic token validation
  const startTokenValidation = useCallback(() => {
    // Clear any existing interval
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
    }
    
    // Check token every 5 minutes
    validationIntervalRef.current = setInterval(async () => {
      if (token) {
        const isValid = await validateToken();
        if (!isValid) {
          handleTokenExpiration();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }, [token, validateToken, handleTokenExpiration]);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Validate the token
        validateToken().then((isValid) => {
          if (isValid) {
            setToken(savedToken);
            setUser(userData);
            // Start periodic validation
            startTokenValidation();
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            notify({
              type: 'warning',
              title: 'Session Expired',
              detail: 'Your previous session has expired. Please log in again.',
              duration: 5000
            });
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [validateToken, startTokenValidation, notify]);

  // Listen for token expiration events from API calls
  useEffect(() => {
    const handleTokenExpired = () => {
      handleTokenExpiration();
    };

    // Listen for the custom token expired event
    window.addEventListener('tokenExpired', handleTokenExpired);

    // Cleanup event listener
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [handleTokenExpiration]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data: LoginResponse = await apiLogin(username, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear validation interval
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }
    
    navigate('/login', { replace: true });
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Main AuthProvider component that doesn't use Router hooks
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}; 