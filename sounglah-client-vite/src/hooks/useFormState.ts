import { useState, useCallback, useRef, useMemo } from 'react';

export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isLoading: boolean;
  hasSubmitted: boolean;
}

export interface FormHandlers<T> {
  setField: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitted: (submitted: boolean) => void;
  reset: (initialData?: T) => void;
  validate: (validator: (data: T) => Record<keyof T, string>) => boolean;
}

export const useFormState = <T extends Record<string, unknown>>(
  initialData: T
): [FormState<T>, FormHandlers<T>] => {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {} as Record<keyof T, string>,
    isLoading: false,
    hasSubmitted: false,
  });

  const initialDataRef = useRef(initialData);

  const setField = useCallback((field: keyof T, value: T[keyof T]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      // Clear error for this field when user starts typing
      errors: {
        ...prev.errors,
        [field]: '',
      },
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: '',
      },
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {} as Record<keyof T, string>,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setSubmitted = useCallback((submitted: boolean) => {
    setState(prev => ({
      ...prev,
      hasSubmitted: submitted,
    }));
  }, []);

  const reset = useCallback((newInitialData?: T) => {
    const dataToUse = newInitialData || initialDataRef.current;
    setState({
      data: dataToUse,
      errors: {} as Record<keyof T, string>,
      isLoading: false,
      hasSubmitted: false,
    });
  }, []);

  const validate = useCallback((validator: (data: T) => Record<keyof T, string>) => {
    const errors = validator(state.data);
    const hasErrors = Object.values(errors).some(error => error.length > 0);
    
    setState(prev => ({
      ...prev,
      errors,
      hasSubmitted: true,
    }));

    return !hasErrors;
  }, [state.data]);

  const handlers: FormHandlers<T> = useMemo(() => ({
    setField,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setLoading,
    setSubmitted,
    reset,
    validate,
  }), [setField, setFieldError, clearFieldError, clearAllErrors, setLoading, setSubmitted, reset, validate]);

  return [state, handlers];
}; 