import { useQuery } from '@tanstack/react-query';
import { getLanguages, type LanguagesResponse } from '@/features/translation/api/languages';
import { getUsers, type UsersResponse } from '@/features/users/api/users';
import type { Language } from '@/features/translation/api/languages';
import type { User } from '@/features/users/api/users';

// Query keys for common data
export const commonDataKeys = {
  languages: ['common', 'languages'] as const,
  users: ['common', 'users'] as const,
  reviewers: ['common', 'users', 'reviewers'] as const,
};

// Centralized hook for languages data
export const useCommonLanguages = () => {
  return useQuery<LanguagesResponse, Error, Language[]>({
    queryKey: commonDataKeys.languages,
    queryFn: getLanguages,
    select: (data) => data.languages,
    staleTime: 10 * 60 * 1000, // 10 minutes - languages don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Centralized hook for all users data
export const useCommonUsers = () => {
  return useQuery<UsersResponse, Error, User[]>({
    queryKey: commonDataKeys.users,
    queryFn: getUsers,
    select: (data) => data.users,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Centralized hook for reviewers data
export const useCommonReviewers = () => {
  return useQuery<UsersResponse, Error, User[]>({
    queryKey: commonDataKeys.reviewers,
    queryFn: () => getUsers('reviewer'),
    select: (data) => data.users,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Combined hook for all common data
export const useCommonData = () => {
  const languages = useCommonLanguages();
  const users = useCommonUsers();
  const reviewers = useCommonReviewers();

  return {
    languages,
    users,
    reviewers,
    isLoading: languages.isLoading || users.isLoading || reviewers.isLoading,
    error: languages.error || users.error || reviewers.error,
  };
}; 