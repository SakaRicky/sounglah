import { useState, useCallback, useMemo } from 'react';
import type { Translation } from '../api/types';
import { useSelectionState } from '@/hooks/useSelectionState';

export interface TableState {
  page: number;
  rowsPerPage: number;
  selectedIds: Set<number>;
  showScrollCue: boolean;
}

export interface TableHandlers {
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  handleSelectRow: (id: number, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  clearSelection: () => void;
  setShowScrollCue: (show: boolean) => void;
}

export const useTranslationTable = (
  translations: Translation[],
  filterDependencies: unknown[],
  totalCount: number = 0,
  paginationState?: {
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  }
) => {
  // Pagination states (use provided state or fallback to internal state)
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(25);
  const [showScrollCue, setShowScrollCue] = useState(false);

  const page = paginationState?.page ?? internalPage;
  const rowsPerPage = paginationState?.rowsPerPage ?? internalRowsPerPage;

  // Selection state management
  const [selectionState, selectionHandlers] = useSelectionState(translations, filterDependencies);
  const { selectedIds, selectAllChecked, selectAllIndeterminate } = selectionState;
  const { selectItem, selectAll, clearSelection } = selectionHandlers;

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    if (paginationState?.onRowsPerPageChange) {
      paginationState.onRowsPerPageChange(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0); // Reset to first page when changing rows per page
    }
  }, [paginationState?.onRowsPerPageChange]);

  // Calculate pagination info (server-side pagination)
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    
    return {
      page,
      rowsPerPage,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages - 1,
      hasPrevPage: page > 0,
    };
  }, [page, rowsPerPage, totalCount]);

  // Selection info
  const selectionInfo = useMemo(() => {
    return {
      selectedCount: selectedIds.size,
      totalCount: translations.length,
      isAllSelected: selectAllChecked,
      isPartiallySelected: selectAllIndeterminate,
    };
  }, [selectedIds.size, translations.length, selectAllChecked, selectAllIndeterminate]);

  const tableState: TableState = {
    page,
    rowsPerPage,
    selectedIds,
    showScrollCue,
  };

  const tableHandlers: TableHandlers = {
    setPage: paginationState?.onPageChange ?? setInternalPage,
    setRowsPerPage: handleRowsPerPageChange,
    handleSelectRow: selectItem,
    handleSelectAll: selectAll,
    clearSelection,
    setShowScrollCue,
  };

  return {
    tableState,
    tableHandlers,
    paginationInfo,
    selectionInfo,
    selectAllChecked,
    selectAllIndeterminate,
  };
}; 