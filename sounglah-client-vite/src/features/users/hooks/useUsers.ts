import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../api/users';
import type { User, UpdateUserRequest, Role, UsersResponse, RolesResponse } from '../api/users';
import { useNotification } from '@/contexts/NotificationContext';

// Useful exported types
export type { User, Role, UpdateUserRequest, UsersResponse, RolesResponse };

export interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
}

export interface CreateUserVariables {
  username: string;
  email: string;
  password: string;
  role_id: number;
}

export interface UpdateUserVariables {
  id: number;
  data: UpdateUserRequest;
}

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
};

// Users query hook
export const useUsers = () => {
  return useQuery<UsersResponse, Error, User[]>({
    queryKey: userKeys.lists(),
    queryFn: () => getUsers(),
    select: (data) => data.users,
  });
};

// Roles query hook
export const useRoles = () => {
  return useQuery<RolesResponse, Error, Role[]>({
    queryKey: roleKeys.lists(),
    queryFn: getRoles,
    select: (data) => data.roles,
  });
};

// Create user mutation hook
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Update the users list with the new user
      queryClient.setQueryData(userKeys.lists(), (oldData: UsersResponse | undefined) => {
        if (!oldData) return { users: [newUser] };
        return {
          ...oldData,
          users: [...oldData.users, newUser],
        };
      });

      notify.notify({
        type: 'success',
        title: 'User Created',
        detail: `User "${newUser.username}" has been created successfully.`
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Create User',
        detail: errorMessage
      });
    },
  });
};

// Update user mutation hook
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: UpdateUserVariables) => 
      updateUser(id, data),
    onSuccess: (updatedUser, variables) => {
      // Update the users list with the updated user
      queryClient.setQueryData(userKeys.lists(), (oldData: UsersResponse | undefined) => {
        if (!oldData) return { users: [updatedUser] };
        return {
          ...oldData,
          users: oldData.users.map((user: User) => 
            user.id === variables.id ? updatedUser : user
          ),
        };
      });

      notify.notify({
        type: 'success',
        title: 'User Updated',
        detail: `User "${updatedUser.username}" has been updated successfully.`
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to update user. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        
        if (axiosError.response?.status === 409) {
          errorMessage = axiosError.response.data?.error || 'Username or email already exists.';
        } else if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.error || 'Invalid data provided.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Update User',
        detail: errorMessage
      });
    },
  });
};

// Delete user mutation hook
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      // Remove the user from the users list
      queryClient.setQueryData(userKeys.lists(), (oldData: UsersResponse | undefined) => {
        if (!oldData) return { users: [] };
        return {
          ...oldData,
          users: oldData.users.filter((user: User) => user.id !== userId),
        };
      });

      notify.notify({
        type: 'success',
        title: 'User Deleted',
        detail: 'User has been deleted successfully.'
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to delete user. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        
        if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.error || 'Cannot delete this user.';
        } else if (axiosError.response?.status === 404) {
          errorMessage = 'User not found.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Delete User',
        detail: errorMessage
      });
    },
  });
}; 