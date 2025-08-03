import { useState, useCallback, useEffect, useMemo } from 'react';

export interface SelectionState {
  selectedIds: Set<number>;
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
}

export interface SelectionHandlers {
  selectItem: (id: number, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clearSelection: () => void;
  getSelectedCount: () => number;
  isSelected: (id: number) => boolean;
}

export const useSelectionState = (
  items: Array<{ id: number }>,
  filterDependencies: unknown[] = []
): [SelectionState, SelectionHandlers] => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllIndeterminate, setSelectAllIndeterminate] = useState(false);

  // Select individual item
  const selectItem = useCallback((id: number, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  // Select all/none
  const selectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(items.map(item => item.id));
      setSelectedIds(allIds);
      setSelectAllChecked(true);
      setSelectAllIndeterminate(false);
    } else {
      setSelectedIds(new Set());
      setSelectAllChecked(false);
      setSelectAllIndeterminate(false);
    }
  }, [items]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAllChecked(false);
    setSelectAllIndeterminate(false);
  }, []);

  // Get count of selected items
  const getSelectedCount = useCallback(() => {
    return selectedIds.size;
  }, [selectedIds]);

  // Check if item is selected
  const isSelected = useCallback((id: number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Update select all/indeterminate state based on current selections
  useEffect(() => {
    const selectedOnCurrentPage = items.filter(item => selectedIds.has(item.id));
    
    if (selectedOnCurrentPage.length === 0) {
      setSelectAllChecked(false);
      setSelectAllIndeterminate(false);
    } else if (selectedOnCurrentPage.length === items.length) {
      setSelectAllChecked(true);
      setSelectAllIndeterminate(false);
    } else {
      setSelectAllChecked(false);
      setSelectAllIndeterminate(true);
    }
  }, [selectedIds, items]);

  // Clear selections when filters change
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, filterDependencies);

  const state: SelectionState = useMemo(() => ({
    selectedIds,
    selectAllChecked,
    selectAllIndeterminate,
  }), [selectedIds, selectAllChecked, selectAllIndeterminate]);

  const handlers: SelectionHandlers = useMemo(() => ({
    selectItem,
    selectAll,
    clearSelection,
    getSelectedCount,
    isSelected,
  }), [selectItem, selectAll, clearSelection, getSelectedCount, isSelected]);

  return [state, handlers];
}; 