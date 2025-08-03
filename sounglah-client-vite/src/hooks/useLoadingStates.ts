import { useState, useCallback } from 'react';

export type LoadingType = 'initial' | 'refresh' | 'pagination' | 'filter' | 'action';

export interface LoadingState {
  isLoading: boolean;
  loadingType: LoadingType | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isPaginating: boolean;
  isFiltering: boolean;
  isPerformingAction: boolean;
}

export interface LoadingHandlers {
  setLoading: (type: LoadingType) => void;
  clearLoading: () => void;
  setInitialLoading: (loading: boolean) => void;
  setRefreshing: (loading: boolean) => void;
  setPaginating: (loading: boolean) => void;
  setFiltering: (loading: boolean) => void;
  setPerformingAction: (loading: boolean) => void;
}

export const useLoadingStates = (initialLoading = false) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading,
    loadingType: initialLoading ? 'initial' : null,
    isInitialLoading: initialLoading,
    isRefreshing: false,
    isPaginating: false,
    isFiltering: false,
    isPerformingAction: false,
  });

  const setLoading = useCallback((type: LoadingType) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: true,
      loadingType: type,
      [`is${type.charAt(0).toUpperCase() + type.slice(1)}Loading`]: true,
    }));
  }, []);

  const clearLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      loadingType: null,
      isInitialLoading: false,
      isRefreshing: false,
      isPaginating: false,
      isFiltering: false,
      isPerformingAction: false,
    }));
  }, []);

  const setInitialLoading = useCallback((loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      loadingType: loading ? 'initial' : null,
      isInitialLoading: loading,
    }));
  }, []);

  const setRefreshing = useCallback((loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      loadingType: loading ? 'refresh' : null,
      isRefreshing: loading,
    }));
  }, []);

  const setPaginating = useCallback((loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      loadingType: loading ? 'pagination' : null,
      isPaginating: loading,
    }));
  }, []);

  const setFiltering = useCallback((loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      loadingType: loading ? 'filter' : null,
      isFiltering: loading,
    }));
  }, []);

  const setPerformingAction = useCallback((loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      loadingType: loading ? 'action' : null,
      isPerformingAction: loading,
    }));
  }, []);

  const handlers: LoadingHandlers = {
    setLoading,
    clearLoading,
    setInitialLoading,
    setRefreshing,
    setPaginating,
    setFiltering,
    setPerformingAction,
  };

  return { loadingState, handlers };
}; 