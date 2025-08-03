import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTranslations, 
  getLanguages, 
  createTranslation, 
  updateTranslation, 
  bulkUpdateTranslations
} from '../api/translations';
import { getUsers } from '../../users/api/users';
import type { 
  Translation, 
  Language, 
  CreateTranslationRequest, 
  UpdateTranslationRequest,
  BulkUpdateRequest,
  TranslationQueryParams,
  KeysetTranslationsResponse,
  LanguagesResponse
} from '../api/types';
import type { User, UsersResponse } from '../../users/api/users';
import { useNotification } from '@/contexts/NotificationContext';

// Useful exported types
export type { 
  Translation, 
  Language, 
  User, 
  CreateTranslationRequest, 
  UpdateTranslationRequest,
  BulkUpdateRequest,
  TranslationQueryParams,
  KeysetTranslationsResponse,
  LanguagesResponse,
  UsersResponse
};

export interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
}

export interface CreateTranslationVariables {
  source_text: string;
  target_text: string;
  source_lang_id: number;
  target_lang_id: number;
}

export interface UpdateTranslationVariables {
  id: number;
  data: UpdateTranslationRequest;
}

export interface BulkUpdateVariables {
  translation_ids: number[];
  action: 'approve' | 'reject';
  reviewer_id?: number;
}

// Query keys
export const translationKeys = {
  all: ['translations'] as const,
  lists: () => [...translationKeys.all, 'list'] as const,
  list: (filters: TranslationQueryParams) => [...translationKeys.lists(), filters] as const,
  details: () => [...translationKeys.all, 'detail'] as const,
  detail: (id: number) => [...translationKeys.details(), id] as const,
};

export const languageKeys = {
  all: ['languages'] as const,
  lists: () => [...languageKeys.all, 'list'] as const,
};

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (role?: string) => [...userKeys.lists(), { role }] as const,
};

// Translations query hook with filtering and pagination
export const useTranslations = (params: TranslationQueryParams & { page?: number; limit?: number }) => {
  return useQuery<KeysetTranslationsResponse, Error>({
    queryKey: translationKeys.list(params),
    queryFn: () => getTranslations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Languages query hook
export const useLanguages = () => {
  return useQuery<LanguagesResponse, Error, Language[]>({
    queryKey: languageKeys.lists(),
    queryFn: () => getLanguages(),
    select: (data) => data.languages,
    staleTime: 10 * 60 * 1000, // 10 minutes - languages don't change often
  });
};

// Users query hook (for reviewers)
export const useUsers = (role?: string) => {
  return useQuery<UsersResponse, Error, User[]>({
    queryKey: userKeys.list(role),
    queryFn: () => getUsers(role),
    select: (data) => data.users,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create translation mutation hook
export const useCreateTranslation = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: createTranslation,
               onSuccess: () => {
             // Invalidate and refetch translations list
             queryClient.invalidateQueries({ queryKey: translationKeys.lists() });

      notify.notify({
        type: 'success',
        title: 'Translation Created',
        detail: 'Translation pair has been created successfully.'
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to create translation. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Create Translation',
        detail: errorMessage
      });
    },
  });
};

// Update translation mutation hook
export const useUpdateTranslation = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTranslationVariables) => 
      updateTranslation(id, data),
    onSuccess: (updatedTranslation) => {
      // Update the specific translation in all lists
      queryClient.setQueriesData(
        { queryKey: translationKeys.lists() },
        (oldData: KeysetTranslationsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            translations: oldData.translations.map((translation: Translation) => 
              translation.id === updatedTranslation.id ? updatedTranslation : translation
            ),
          };
        }
      );

      notify.notify({
        type: 'success',
        title: 'Translation Updated',
        detail: 'Translation pair has been updated successfully.'
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to update translation. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        
        if (axiosError.response?.status === 409) {
          errorMessage = axiosError.response.data?.error || 'Translation already exists.';
        } else if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.error || 'Invalid data provided.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Update Translation',
        detail: errorMessage
      });
    },
  });
};

// Bulk update translations mutation hook
export const useBulkUpdateTranslations = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ translation_ids, action, reviewer_id }: BulkUpdateVariables) => 
      bulkUpdateTranslations({ translation_ids, action, reviewer_id }),
    onSuccess: (result, variables) => {
      // Invalidate and refetch translations list
      queryClient.invalidateQueries({ queryKey: translationKeys.lists() });

      const actionText = variables.action === 'approve' ? 'approved' : 'rejected';
      const isBulk = variables.translation_ids.length > 1;
      
      notify.notify({
        type: 'success',
        title: isBulk ? 'Bulk Update Complete' : `Translation ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        detail: isBulk 
          ? `${variables.translation_ids.length} translations have been ${actionText} successfully.`
          : `Translation has been ${actionText} successfully.`
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to update translations. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        
        if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.error || 'Invalid request.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Update Translations',
        detail: errorMessage
      });
    },
  });
}; 