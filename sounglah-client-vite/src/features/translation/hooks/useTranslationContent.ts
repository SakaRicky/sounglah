import { useRef, useEffect, useState, useCallback } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Translation } from '../api/types';
import type { Language } from '../api/types';
import type { User } from '../../users/api/users';
import type { TranslationFilters, FilterHandlers } from './useTranslationFilters';
import type { TableState, TableHandlers } from './useTranslationTable';
import type { BulkActionState, BulkActionHandlers } from './useBulkActions';
import type { ExportState, ExportHandlers } from './useExport';
import { useTranslationTable } from './useTranslationTable';
import { useBulkActions } from './useBulkActions';

export interface TranslationContentState {
  translations: Translation[];
  languages: Language[];
  reviewers: User[];
  filters: TranslationFilters;
  filterHandlers: FilterHandlers;
  stagedFilters: TranslationFilters;
  tableState: TableState;
  tableHandlers: TableHandlers;
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
  bulkActionState: BulkActionState;
  bulkActionHandlers: BulkActionHandlers;
  exportState: ExportState;
  exportHandlers: ExportHandlers;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  isLoading: boolean;
  isMobile: boolean;
  showScrollCue: boolean;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  filtersDrawerOpen: boolean;
  activeFilterCount: number;
}

export interface TranslationContentHandlers {
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onAddClick: () => void;
  onUploadClick: () => void;
  handleEditClick: (translation: Translation) => void;
  handleApprove: (translation: Translation) => void;
  handleDeny: (translation: Translation) => void;
  getStatusBadge: (status: string, isMobile?: boolean) => { type: string; color: string; symbol?: string; title?: string; text?: string; style?: string };
  setFiltersDrawerOpen?: (open: boolean) => void;
  setStagedFilters?: (update: { key: keyof TranslationFilters; value: string }) => void;
  applyStagedFilters?: () => void;
  handleResetStagedFilters?: () => void;
}

export const useTranslationContent = (
  translations: Translation[],
  languages: Language[],
  reviewers: User[],
  filters: TranslationFilters,
  filterHandlers: FilterHandlers,
  exportState: ExportState,
  exportHandlers: ExportHandlers,
  page: number,
  rowsPerPage: number,
  totalCount: number,
  isLoading: boolean,
  onPageChange: (page: number) => void,
  onRowsPerPageChange: (rowsPerPage: number) => void,
  onAddClick: () => void,
  onUploadClick: () => void,
  handleEditClick: (translation: Translation) => void,
  handleApprove: (translation: Translation) => void,
  handleDeny: (translation: Translation) => void,
) => {
  // Import and use the table hook internally
  const {
    tableState,
    tableHandlers,
    selectAllChecked,
    selectAllIndeterminate,
  } = useTranslationTable(
    translations, 
    [
      filters.languageFilter,
      filters.targetLanguageFilter,
      filters.statusFilter,
      filters.startDate,
      filters.endDate,
      filters.searchTerm,
    ], 
    totalCount,
    {
      page,
      rowsPerPage,
      onPageChange,
      onRowsPerPageChange,
    }
  );

  // Use bulk actions with the current selected IDs
  const {
    bulkActionState,
    bulkActionHandlers,
  } = useBulkActions(tableState.selectedIds);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [stagedFilters, setStagedFiltersState] = useState<TranslationFilters>(filters);

  // Mobile scroll detection
  useEffect(() => {
    if (!isMobile) {
      setShowScrollCue(false);
      return;
    }
    const checkScroll = () => {
      const el = tableContainerRef.current;
      if (el) {
        setShowScrollCue(el.scrollWidth > el.clientWidth + 8);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [isMobile, translations]);

  // Keyboard shortcuts for selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A to select all on current page
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        tableHandlers.handleSelectAll(true);
      }
      // Escape to clear selection
      if (event.key === 'Escape') {
        tableHandlers.clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tableHandlers]);

  // Keep staged filters in sync when opening drawer
  useEffect(() => {
    if (filtersDrawerOpen) {
      setStagedFiltersState(filters);
    }
  }, [filtersDrawerOpen, filters]);

  const setStagedFilters = useCallback((update: { key: keyof TranslationFilters; value: string }) => {
    setStagedFiltersState((prev) => ({ ...prev, [update.key]: update.value }));
  }, []);

  const applyStagedFilters = useCallback(() => {
    // Apply staged values to real filters through handlers
    filterHandlers.setLanguageFilter(stagedFilters.languageFilter);
    filterHandlers.setTargetLanguageFilter(stagedFilters.targetLanguageFilter);
    filterHandlers.setStatusFilter(stagedFilters.statusFilter);
    filterHandlers.setStartDate(stagedFilters.startDate);
    filterHandlers.setEndDate(stagedFilters.endDate);
    filterHandlers.setSearchTerm(stagedFilters.searchTerm);
    setFiltersDrawerOpen(false);
  }, [stagedFilters, filterHandlers]);

  const handleResetStagedFilters = useCallback(() => {
    setStagedFiltersState({
      languageFilter: '',
      targetLanguageFilter: '',
      statusFilter: '',
      startDate: '',
      endDate: '',
      reviewerFilter: '',
      searchTerm: '',
    });
  }, []);

  const activeFilterCount = (
    (filters.languageFilter ? 1 : 0) +
    (filters.targetLanguageFilter ? 1 : 0) +
    (filters.statusFilter ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.reviewerFilter ? 1 : 0) +
    (filters.searchTerm ? 1 : 0)
  );

  const getStatusBadge = useCallback((status: string, isMobile?: boolean) => {
    if (isMobile) {
      if (status === 'approved') return { type: 'mobile', color: '#388e3c', symbol: '✓', title: 'Approved' };
      if (status === 'pending') return { type: 'mobile', color: '#fbc02d', symbol: '⏳', title: 'Pending' };
      if (status === 'rejected') return { type: 'mobile', color: '#d32f2f', symbol: '✗', title: 'Rejected' };
      return { type: 'mobile', color: '#bdbdbd', symbol: '?', title: status };
    }
    if (status === 'approved') return { type: 'desktop', color: '#388e3c', text: 'Approved', style: 'approved' };
    if (status === 'pending') return { type: 'desktop', color: '#fbc02d', text: 'Pending', style: 'pending' };
    if (status === 'rejected') return { type: 'desktop', color: '#d32f2f', text: 'Rejected', style: 'rejected' };
    return { type: 'desktop', color: '#bdbdbd', text: status, style: 'default' };
  }, []);

  const state: TranslationContentState = {
    translations,
    languages,
    reviewers,
    filters,
    filterHandlers,
    stagedFilters,
    tableState,
    tableHandlers,
    selectAllChecked,
    selectAllIndeterminate,
    bulkActionState,
    bulkActionHandlers,
    exportState,
    exportHandlers,
    page,
    rowsPerPage,
    totalCount,
    isLoading,
    isMobile,
    showScrollCue,
    tableContainerRef,
    filtersDrawerOpen,
    activeFilterCount,
  };

  const handlers: TranslationContentHandlers = {
    onPageChange,
    onRowsPerPageChange,
    onAddClick,
    onUploadClick,
    handleEditClick,
    handleApprove,
    handleDeny,
    getStatusBadge,
    setFiltersDrawerOpen,
    setStagedFilters,
    applyStagedFilters,
    handleResetStagedFilters,
  };

  return { state, handlers };
}; 