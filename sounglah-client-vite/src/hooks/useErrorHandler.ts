import { useCallback } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { ErrorHandler, type AppError } from '@/utils/errorHandling';

export interface UseErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  context?: Record<string, unknown>;
}

export interface ErrorHandlerResult {
  handleError: (error: unknown, options?: UseErrorHandlerOptions) => AppError;
  handleAsyncError: <T>(
    operation: () => Promise<T>,
    options?: UseErrorHandlerOptions & { 
      successMessage?: string;
      errorTitle?: string;
      errorDetail?: string;
    }
  ) => Promise<T>;
  handleMutationError: (error: unknown, context?: Record<string, unknown>) => void;
  handleQueryError: (error: unknown, context?: Record<string, unknown>) => void;
}

export const useErrorHandler = (): ErrorHandlerResult => {
  const notify = useNotification();

  const handleError = useCallback((error: unknown, options: UseErrorHandlerOptions = {}): AppError => {
    const {
      showNotification = true,
      logToConsole = true,
      context = {},
    } = options;

    // Create standardized app error
    const appError = ErrorHandler.createAppError(error, context, {
      logToConsole,
    });

    // Show notification if requested
    if (showNotification) {
      notify.notify({
        type: 'error',
        title: 'Error',
        detail: appError.userMessage,
        onRetry: ErrorHandler.isRetryableError(appError) ? () => {
          // Could implement retry logic here
          window.location.reload();
        } : undefined,
      });
    }

    return appError;
  }, [notify]);

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    options: UseErrorHandlerOptions & {
      successMessage?: string;
      errorTitle?: string;
      errorDetail?: string;
    } = {}
  ): Promise<T> => {
    const {
      successMessage,
      errorTitle,
      errorDetail,
      ...errorOptions
    } = options;

    try {
      const result = await operation();
      
      // Show success message if provided
      if (successMessage) {
        notify.notify({
          type: 'success',
          title: 'Success',
          detail: successMessage,
        });
      }
      
      return result;
    } catch (error) {
      const appError = handleError(error, errorOptions);
      
      // Show custom error notification if provided
      if (errorTitle || errorDetail) {
        notify.notify({
          type: 'error',
          title: errorTitle || 'Error',
          detail: errorDetail || appError.userMessage,
          onRetry: ErrorHandler.isRetryableError(appError) ? () => {
            window.location.reload();
          } : undefined,
        });
      }
      
      throw appError;
    }
  }, [handleError, notify]);

  const handleMutationError = useCallback((error: unknown, context?: Record<string, unknown>) => {
    const appError = ErrorHandler.createAppError(error, context);
    
    notify.notify({
      type: 'error',
      title: 'Operation Failed',
      detail: appError.userMessage,
      onRetry: ErrorHandler.isRetryableError(appError) ? () => {
        window.location.reload();
      } : undefined,
    });
  }, [notify]);

  const handleQueryError = useCallback((error: unknown, context?: Record<string, unknown>) => {
    const appError = ErrorHandler.createAppError(error, context);
    
    // For query errors, we might want to show a different UI or retry mechanism
    notify.notify({
      type: 'error',
      title: 'Failed to Load Data',
      detail: appError.userMessage,
      onRetry: ErrorHandler.isRetryableError(appError) ? () => {
        window.location.reload();
      } : undefined,
    });
  }, [notify]);

  return {
    handleError,
    handleAsyncError,
    handleMutationError,
    handleQueryError,
  };
}; 