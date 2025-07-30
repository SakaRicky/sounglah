import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateToken, useLogin, useLogout, useAuthState, type User } from '@/features/auth/hooks/useAuth';

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

  // React Query hooks
  const { getStoredToken, getStoredUser, isAuthenticated: checkAuth, clearAuth } = useAuthState();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // Token validation with React Query
  const { data: validationData, isLoading: isValidating, error: validationError } = useValidateToken(
    !!getStoredToken() // Only validate if we have a stored token
  );

  const handleTokenExpiration = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setLoading(false);
    navigate('/login');
  }, [clearAuth, navigate]);

  // Initialize auth state on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    
    setLoading(false);
  }, [getStoredToken, getStoredUser]);

  // Update state when validation completes
  useEffect(() => {
    if (!isValidating && validationData) {
      if (validationData.valid) {
        setToken(getStoredToken());
        setUser(validationData.user);
      } else {
        // Token is invalid, clear auth
        handleTokenExpiration();
      }
    } else if (!isValidating && validationError) {
      // Validation failed, clear auth
      handleTokenExpiration();
    }
  }, [isValidating, validationData, validationError, getStoredToken, handleTokenExpiration]);

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
      await loginMutation.mutateAsync({ username, password });
      navigate('/admin');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [loginMutation, navigate]);

  const logout = useCallback(() => {
    logoutMutation.mutate();
    navigate('/login');
  }, [logoutMutation, navigate]);

  const value: AuthContextType = {
    token,
    user,
    loading: loading || isValidating,
    isAuthenticated: checkAuth(),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 