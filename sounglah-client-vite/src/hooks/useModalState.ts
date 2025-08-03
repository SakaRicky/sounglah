import { useState, useCallback, useMemo } from 'react';

export interface ModalState<T = unknown> {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'view';
  data: T | null;
}

export interface ModalHandlers<T = unknown> {
  openAdd: () => void;
  openEdit: (data: T) => void;
  openView: (data: T) => void;
  close: () => void;
  setData: (data: T | null) => void;
}

export const useModalState = <T = unknown>(): [ModalState<T>, ModalHandlers<T>] => {
  const [state, setState] = useState<ModalState<T>>({
    isOpen: false,
    mode: 'add',
    data: null,
  });

  const openAdd = useCallback(() => {
    setState({
      isOpen: true,
      mode: 'add',
      data: null,
    });
  }, []);

  const openEdit = useCallback((data: T) => {
    setState({
      isOpen: true,
      mode: 'edit',
      data,
    });
  }, []);

  const openView = useCallback((data: T) => {
    setState({
      isOpen: true,
      mode: 'view',
      data,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      mode: 'add',
      data: null,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  const handlers: ModalHandlers<T> = useMemo(() => ({
    openAdd,
    openEdit,
    openView,
    close,
    setData,
  }), [openAdd, openEdit, openView, close, setData]);

  return [state, handlers];
}; 