import api from '@/api/axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role_id: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
}

export interface CreateUserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface UpdateUserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface UsersResponse {
  users: User[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface RolesResponse {
  roles: Role[];
}

// Fetch all users
export const getUsers = async (role?: string): Promise<UsersResponse> => {
  const params = role ? { role } : {};
  const response = await api.get('/users/list', { params });
  return response.data;
};

// Create a new user
export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post(`${API_BASE_URL}/users`, userData, { headers });
  return response.data;
};

// Update an existing user
export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.put(`${API_BASE_URL}/users/${userId}`, userData, { headers });
  return response.data;
};

// Create a new role
export const createRole = async (role: { name: string; description?: string }) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post(`${API_BASE_URL}/roles`, role, { headers });
  return response.data;
};

// Fetch all roles
export const getRoles = async (): Promise<RolesResponse> => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get(`${API_BASE_URL}/roles/list`, { headers });
  return response.data;
};

// Update a role
export const updateRole = async (roleId: number, data: { name: string; description?: string }) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.put(`${API_BASE_URL}/roles/${roleId}`, data, { headers });
  return response.data;
};

// Delete a role
export const deleteRole = async (roleId: number) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.delete(`${API_BASE_URL}/roles/${roleId}`, { headers });
  return response.data;
}; 