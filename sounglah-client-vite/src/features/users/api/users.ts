import api from '@/api/axios';

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
  const response = await api.post('/users', userData);
  return response.data;
};

// Update an existing user
export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// Delete a user
export const deleteUser = async (userId: number): Promise<{ message: string; deleted_user: { id: number; username: string } }> => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Create a new role
export const createRole = async (role: { name: string; description?: string }) => {
  const response = await api.post('/roles', role);
  return response.data;
};

// Fetch all roles
export const getRoles = async (): Promise<RolesResponse> => {
  const response = await api.get('/roles/list');
  return response.data;
};

// Update a role
export const updateRole = async (roleId: number, data: { name: string; description?: string }) => {
  const response = await api.put(`/roles/${roleId}`, data);
  return response.data;
};

// Delete a role
export const deleteRole = async (roleId: number) => {
  const response = await api.delete(`/roles/${roleId}`);
  return response.data;
}; 