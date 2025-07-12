import { useState, useEffect, useCallback } from 'react';

export function useBulkSelection<T extends { id: number }>(
  translations: T[],
  filterDeps: unknown[] = []
) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllIndeterminate, setSelectAllIndeterminate] = useState(false);

  // Select all/none handler
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(translations.map(t => t.id));
      setSelectedIds(allIds);
      setSelectAllChecked(true);
      setSelectAllIndeterminate(false);
    } else {
      setSelectedIds(new Set());
      setSelectAllChecked(false);
      setSelectAllIndeterminate(false);
    }
  }, [translations]);

  // Select individual row
  const handleSelectRow = useCallback((translationId: number, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(translationId);
      } else {
        newSet.delete(translationId);
      }
      return newSet;
    });
  }, []);

  // Update select all/indeterminate state
  useEffect(() => {
    const selectedOnCurrentPage = translations.filter(t => selectedIds.has(t.id));
    if (selectedOnCurrentPage.length === 0) {
      setSelectAllChecked(false);
      setSelectAllIndeterminate(false);
    } else if (selectedOnCurrentPage.length === translations.length) {
      setSelectAllChecked(true);
      setSelectAllIndeterminate(false);
    } else {
      setSelectAllChecked(false);
      setSelectAllIndeterminate(true);
    }
  }, [selectedIds, translations]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectAllChecked(false);
    setSelectAllIndeterminate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, filterDeps);

  // Keyboard shortcuts for selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        handleSelectAll(true);
      }
      if (event.key === 'Escape') {
        setSelectedIds(new Set());
        setSelectAllChecked(false);
        setSelectAllIndeterminate(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll]);

  return {
    selectedIds,
    setSelectedIds,
    selectAllChecked,
    selectAllIndeterminate,
    handleSelectAll,
    handleSelectRow,
  };
} 