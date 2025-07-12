import { useState, useCallback, useRef } from 'react';
import type { Translation } from '../api/types';

export interface UndoAction {
  id: string;
  type: 'approve' | 'reject' | 'edit';
  translationId: number;
  previousState: Translation;
  timestamp: number;
  description: string;
}

export interface UseUndoHistoryReturn {
  addAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => string;
  undoLastAction: () => UndoAction | null;
  popActionById: (actionId: string) => UndoAction | null;
  canUndo: boolean;
  getLastAction: () => UndoAction | null;
  clearHistory: () => void;
  getHistory: () => UndoAction[];
  isRecentlyModified: (translationId: number, timeWindowMs?: number) => boolean;
}

export function useUndoHistory(maxHistorySize: number = 10): UseUndoHistoryReturn {
  const [history, setHistory] = useState<UndoAction[]>([]);
  const nextId = useRef(1);

  const addAction = useCallback((action: Omit<UndoAction, 'id' | 'timestamp'>): string => {
    const newAction: UndoAction = {
      ...action,
      id: `undo-${nextId.current++}`,
      timestamp: Date.now(),
    };
    setHistory(prev => {
      const newHistory = [newAction, ...prev];
      return newHistory.slice(0, maxHistorySize);
    });
    return newAction.id;
  }, [maxHistorySize]);

  const undoLastAction = useCallback((): UndoAction | null => {
    if (history.length === 0) return null;
    const lastAction = history[0];
    setHistory(prev => prev.slice(1));
    return lastAction;
  }, [history]);

  const popActionById = useCallback((actionId: string): UndoAction | null => {
    let found: UndoAction | null = null;
    setHistory(prev => {
      const idx = prev.findIndex(a => a.id === actionId);
      if (idx === -1) return prev;
      found = prev[idx];
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    return found;
  }, []);

  const canUndo = history.length > 0;

  const getLastAction = useCallback((): UndoAction | null => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getHistory = useCallback(() => {
    return [...history];
  }, [history]);

  const isRecentlyModified = useCallback((translationId: number, timeWindowMs: number = 5000): boolean => {
    const now = Date.now();
    return history.some(action => 
      action.translationId === translationId && 
      (now - action.timestamp) < timeWindowMs
    );
  }, [history]);

  return {
    addAction,
    undoLastAction,
    popActionById,
    canUndo,
    getLastAction,
    clearHistory,
    getHistory,
    isRecentlyModified,
  };
} 