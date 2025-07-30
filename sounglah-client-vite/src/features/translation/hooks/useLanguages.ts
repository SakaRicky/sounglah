import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from '../api/languages';
import type { Language, CreateLanguageRequest, UpdateLanguageRequest, LanguagesResponse } from '../api/languages';
import { useNotification } from '@/contexts/NotificationContext';

// Useful exported types
export type { Language, CreateLanguageRequest, UpdateLanguageRequest, LanguagesResponse };

export interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
}

export interface CreateLanguageVariables {
  name: string;
  iso_code: string;
  region?: string;
  description?: string;
}

export interface UpdateLanguageVariables {
  id: number;
  data: UpdateLanguageRequest;
}

// Query keys
export const languageKeys = {
  all: ['languages'] as const,
  lists: () => [...languageKeys.all, 'list'] as const,
  list: (filters: string) => [...languageKeys.lists(), { filters }] as const,
  details: () => [...languageKeys.all, 'detail'] as const,
  detail: (id: number) => [...languageKeys.details(), id] as const,
};

// Languages query hook
export const useLanguages = () => {
  return useQuery<LanguagesResponse, Error, Language[]>({
    queryKey: languageKeys.lists(),
    queryFn: () => getLanguages(),
    select: (data) => data.languages,
  });
};

// Create language mutation hook
export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: createLanguage,
    onSuccess: (newLanguage) => {
      // Update the languages list with the new language
      queryClient.setQueryData(languageKeys.lists(), (oldData: LanguagesResponse | undefined) => {
        if (!oldData) return { languages: [newLanguage] };
        return {
          ...oldData,
          languages: [...oldData.languages, newLanguage],
        };
      });

      notify.notify({
        type: 'success',
        title: 'Language Created',
        detail: `Language "${newLanguage.name}" has been created successfully.`
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to create language. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Create Language',
        detail: errorMessage
      });
    },
  });
};

// Update language mutation hook
export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: UpdateLanguageVariables) => 
      updateLanguage(id, data),
    onSuccess: (updatedLanguage, variables) => {
      // Update the languages list with the updated language
      queryClient.setQueryData(languageKeys.lists(), (oldData: LanguagesResponse | undefined) => {
        if (!oldData) return { languages: [updatedLanguage] };
        return {
          ...oldData,
          languages: oldData.languages.map((language: Language) => 
            language.id === variables.id ? updatedLanguage : language
          ),
        };
      });

      notify.notify({
        type: 'success',
        title: 'Language Updated',
        detail: `Language "${updatedLanguage.name}" has been updated successfully.`
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to update language. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        
        if (axiosError.response?.status === 409) {
          errorMessage = axiosError.response.data?.error || 'Language name or ISO code already exists.';
        } else if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.error || 'Invalid data provided.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Update Language',
        detail: errorMessage
      });
    },
  });
};

// Delete language mutation hook
export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: deleteLanguage,
    onSuccess: (_, languageId) => {
      // Remove the language from the languages list
      queryClient.setQueryData(languageKeys.lists(), (oldData: LanguagesResponse | undefined) => {
        if (!oldData) return { languages: [] };
        return {
          ...oldData,
          languages: oldData.languages.filter((language: Language) => language.id !== languageId),
        };
      });

      notify.notify({
        type: 'success',
        title: 'Language Deleted',
        detail: 'Language has been deleted successfully.'
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to delete language. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        
        if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.error || 'Cannot delete this language.';
        } else if (axiosError.response?.status === 404) {
          errorMessage = 'Language not found.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      notify.notify({
        type: 'error',
        title: 'Failed to Delete Language',
        detail: errorMessage
      });
    },
  });
}; 