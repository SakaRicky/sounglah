import api from './axios';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  message: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', { username, password });
  return response.data;
}

export async function validateToken(): Promise<ValidateTokenResponse> {
  const response = await api.get<ValidateTokenResponse>('/auth/validate');
  return response.data;
}

// Optionally, add a logout endpoint if your backend supports it
// export async function logout() {
//   return api.post('/logout');
// } 