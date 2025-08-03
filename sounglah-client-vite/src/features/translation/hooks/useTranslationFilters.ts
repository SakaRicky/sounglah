import { useState, useRef, useCallback, useMemo } from 'react';
import type { TranslationQueryParams } from './useTranslations';

export interface TranslationFilters {
  languageFilter: string;
  targetLanguageFilter: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
  reviewerFilter: string;
}

export interface DebouncedFilters {
  debouncedLanguageFilter: string;
  debouncedTargetLanguageFilter: string;
  debouncedStatusFilter: string;
  debouncedStartDate: string;
  debouncedEndDate: string;
}

export interface FilterHandlers {
  setLanguageFilter: (value: string) => void;
  setTargetLanguageFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setReviewerFilter: (value: string) => void;
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
}

export const useTranslationFilters = () => {
  // Filter states
  const [languageFilter, setLanguageFilter] = useState('');
  const [targetLanguageFilter, setTargetLanguageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reviewerFilter, setReviewerFilter] = useState('');
  
  // Debounced filters for API calls
  const [debouncedLanguageFilter, setDebouncedLanguageFilter] = useState('');
  const [debouncedTargetLanguageFilter, setDebouncedTargetLanguageFilter] = useState('');
  const [debouncedStatusFilter, setDebouncedStatusFilter] = useState('');
  const [debouncedStartDate, setDebouncedStartDate] = useState('');
  const [debouncedEndDate, setDebouncedEndDate] = useState('');
  
  // Timeout refs for debouncing
  const languageFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetLanguageFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced filter setters for performance optimization
  const setLanguageFilterWithLog = useCallback((val: string) => {
    setLanguageFilter(val);
    if (languageFilterTimeoutRef.current) {
      clearTimeout(languageFilterTimeoutRef.current);
    }
    languageFilterTimeoutRef.current = setTimeout(() => {
      setDebouncedLanguageFilter(val);
    }, 300);
  }, []);

  const setTargetLanguageFilterWithLog = useCallback((val: string) => {
    setTargetLanguageFilter(val);
    if (targetLanguageFilterTimeoutRef.current) {
      clearTimeout(targetLanguageFilterTimeoutRef.current);
    }
    targetLanguageFilterTimeoutRef.current = setTimeout(() => {
      setDebouncedTargetLanguageFilter(val);
    }, 300);
  }, []);

  const setStatusFilterWithLog = useCallback((val: string) => {
    setStatusFilter(val);
    if (statusFilterTimeoutRef.current) {
      clearTimeout(statusFilterTimeoutRef.current);
    }
    statusFilterTimeoutRef.current = setTimeout(() => {
      setDebouncedStatusFilter(val);
    }, 300);
  }, []);

  const setStartDateWithLog = useCallback((val: string) => {
    setStartDate(val);
    if (startDateTimeoutRef.current) {
      clearTimeout(startDateTimeoutRef.current);
    }
    startDateTimeoutRef.current = setTimeout(() => {
      setDebouncedStartDate(val);
    }, 300);
  }, []);

  const setEndDateWithLog = useCallback((val: string) => {
    setEndDate(val);
    if (endDateTimeoutRef.current) {
      clearTimeout(endDateTimeoutRef.current);
    }
    endDateTimeoutRef.current = setTimeout(() => {
      setDebouncedEndDate(val);
    }, 300);
  }, []);

  // Filter removal handlers
  const removeFilter = useCallback((key: string) => {
    switch (key) {
      case 'status':
        setStatusFilter('');
        setDebouncedStatusFilter('');
        break;
      case 'language':
        setLanguageFilter('');
        setDebouncedLanguageFilter('');
        break;
      case 'targetLanguage':
        setTargetLanguageFilter('');
        setDebouncedTargetLanguageFilter('');
        break;
      case 'reviewer':
        setReviewerFilter('');
        break;
      case 'startDate':
        setStartDate('');
        setDebouncedStartDate('');
        break;
      case 'endDate':
        setEndDate('');
        setDebouncedEndDate('');
        break;
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setLanguageFilter('');
    setTargetLanguageFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setReviewerFilter('');
    setDebouncedLanguageFilter('');
    setDebouncedTargetLanguageFilter('');
    setDebouncedStatusFilter('');
    setDebouncedStartDate('');
    setDebouncedEndDate('');
  }, []);

  // Build query parameters for API calls
  const buildQueryParams = useCallback((page: number, rowsPerPage: number): TranslationQueryParams & { page?: number; limit?: number } => {
    const params: TranslationQueryParams & { page?: number; limit?: number } = {};
    if (debouncedLanguageFilter) params.source_lang = debouncedLanguageFilter;
    if (debouncedTargetLanguageFilter) params.target_lang = debouncedTargetLanguageFilter;
    if (debouncedStatusFilter) params.status = debouncedStatusFilter;
    if (debouncedStartDate) params.created_at_start = debouncedStartDate;
    if (debouncedEndDate) params.created_at_end = debouncedEndDate;
    params.page = page + 1; // 1-based page for backend
    params.limit = rowsPerPage;
    return params;
  }, [debouncedLanguageFilter, debouncedTargetLanguageFilter, debouncedStatusFilter, debouncedStartDate, debouncedEndDate]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      languageFilter ||
      targetLanguageFilter ||
      statusFilter ||
      startDate ||
      endDate ||
      reviewerFilter
    );
  }, [languageFilter, targetLanguageFilter, statusFilter, startDate, endDate, reviewerFilter]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (languageFilter) count++;
    if (targetLanguageFilter) count++;
    if (statusFilter) count++;
    if (startDate) count++;
    if (endDate) count++;
    if (reviewerFilter) count++;
    return count;
  }, [languageFilter, targetLanguageFilter, statusFilter, startDate, endDate, reviewerFilter]);

  const filters: TranslationFilters = {
    languageFilter,
    targetLanguageFilter,
    statusFilter,
    startDate,
    endDate,
    reviewerFilter,
  };

  const debouncedFilters: DebouncedFilters = {
    debouncedLanguageFilter,
    debouncedTargetLanguageFilter,
    debouncedStatusFilter,
    debouncedStartDate,
    debouncedEndDate,
  };

  const handlers: FilterHandlers = {
    setLanguageFilter: setLanguageFilterWithLog,
    setTargetLanguageFilter: setTargetLanguageFilterWithLog,
    setStatusFilter: setStatusFilterWithLog,
    setStartDate: setStartDateWithLog,
    setEndDate: setEndDateWithLog,
    setReviewerFilter,
    removeFilter,
    clearAllFilters,
  };

  return {
    filters,
    debouncedFilters,
    handlers,
    buildQueryParams,
    hasActiveFilters,
    activeFilterCount,
  };
}; 