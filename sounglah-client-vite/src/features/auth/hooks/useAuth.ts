import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, validateToken as apiValidateToken } from '@/api/auth';
import type { LoginResponse, ValidateTokenResponse } from '@/api/auth';

// Useful exported types
export type { LoginResponse, ValidateTokenResponse };

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
}

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  token: () => [...authKeys.all, 'token'] as const,
};

// Token validation query hook
export const useValidateToken = (enabled: boolean = true) => {
  return useQuery<ValidateTokenResponse, Error>({
    queryKey: authKeys.user(),
    queryFn: apiValidateToken,
    enabled,
    staleTime: 4 * 60 * 1000, // 4 minutes - validate before token expires
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on failure
  });
};

// Login mutation hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: LoginCredentials) => apiLogin(username, password),
    onSuccess: (data: LoginResponse) => {
      // Store token and user in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update query cache
      queryClient.setQueryData(authKeys.token(), data.token);
      queryClient.setQueryData(authKeys.user(), { valid: true, user: data.user });
    },
    onError: (error: unknown) => {
      console.error('Login failed:', error);
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear query cache
      queryClient.clear();
      
      return true;
    },
  });
};

// Hook for managing authentication state
export const useAuthState = () => {
  const queryClient = useQueryClient();

  const getStoredToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  };

  const isAuthenticated = (): boolean => {
    return !!getStoredToken() && !!getStoredUser();
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    queryClient.clear();
  };

  return {
    getStoredToken,
    getStoredUser,
    isAuthenticated,
    clearAuth,
  };
}; 