/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Comprehensive error handling utilities for the translation management system
 */

export interface AppError {
  id: string;
  type: ErrorType;
  message: string;
  userMessage: string;
  recoverySuggestion?: string;
  timestamp: Date;
  context?: Record<string, any>;
  originalError?: Error;
}

export const ErrorType = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface ErrorConfig {
  showNotification?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export class ErrorHandler {
  private static generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getErrorType(error: any): ErrorType {
    if (error?.response?.status) {
      const status = error.response.status;
      
      if (status === 401) return ErrorType.AUTHENTICATION;
      if (status === 403) return ErrorType.AUTHORIZATION;
      if (status === 404) return ErrorType.NOT_FOUND;
      if (status >= 500) return ErrorType.SERVER_ERROR;
      if (status >= 400) return ErrorType.CLIENT_ERROR;
    }
    
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
      return ErrorType.NETWORK;
    }
    
    if (error?.name === 'ValidationError') {
      return ErrorType.VALIDATION;
    }
    
    return ErrorType.UNKNOWN;
  }

  private static getUserMessage(errorType: ErrorType, originalMessage?: string): string {
    console.log("🚀 ~ ErrorHandler ~ getUserMessage ~ originalMessage:", originalMessage)
    const messages = {
      [ErrorType.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
      [ErrorType.VALIDATION]: 'The information you provided is invalid. Please check your input and try again.',
      [ErrorType.AUTHENTICATION]: 'Your session has expired. Please log in again.',
      [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
      [ErrorType.CLIENT_ERROR]: 'There was an issue with your request. Please check your input.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    
    return messages[errorType] || messages[ErrorType.UNKNOWN];
  }

  private static getRecoverySuggestion(errorType: ErrorType): string | undefined {
    const suggestions = {
      [ErrorType.NETWORK]: 'Check your internet connection and try again.',
      [ErrorType.VALIDATION]: 'Review the highlighted fields and correct any errors.',
      [ErrorType.AUTHENTICATION]: 'Click "Login" to sign in again.',
      [ErrorType.AUTHORIZATION]: 'Contact your administrator if you believe this is an error.',
      [ErrorType.NOT_FOUND]: 'The resource may have been moved or deleted.',
      [ErrorType.SERVER_ERROR]: 'Try again in a few minutes. If the problem persists, contact support.',
      [ErrorType.CLIENT_ERROR]: 'Refresh the page and try again.',
      [ErrorType.UNKNOWN]: 'Refresh the page or contact support if the problem continues.',
    };
    
    return suggestions[errorType];
  }

  static createAppError(
    error: any,
    context?: Record<string, any>,
    config: ErrorConfig = {}
  ): AppError {
    const errorType = this.getErrorType(error);
    const userMessage = this.getUserMessage(errorType, error?.message);
    const recoverySuggestion = this.getRecoverySuggestion(errorType);
    
    const appError: AppError = {
      id: this.generateErrorId(),
      type: errorType,
      message: error?.message || 'Unknown error occurred',
      userMessage,
      recoverySuggestion,
      timestamp: new Date(),
      context,
      originalError: error,
    };

    // Log error if configured
    if (config.logToConsole !== false) {
      console.error('App Error:', appError);
    }

    return appError;
  }

  static isRetryableError(error: AppError): boolean {
    const retryableTypes: ErrorType[] = [
      ErrorType.NETWORK,
      ErrorType.SERVER_ERROR,
      ErrorType.UNKNOWN,
    ];
    
    return retryableTypes.includes(error.type);
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }

  static formatValidationErrors(errors: Record<string, string[]>): string {
    return Object.entries(errors)
      .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
      .join('; ');
  }

  static sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/password[^a-zA-Z0-9]*[a-zA-Z0-9]+/gi, '[PASSWORD]')
      .replace(/token[^a-zA-Z0-9]*[a-zA-Z0-9]+/gi, '[TOKEN]')
      .replace(/key[^a-zA-Z0-9]*[a-zA-Z0-9]+/gi, '[KEY]');
  }
}

// Convenience functions for common error scenarios
export const createNetworkError = (error: any, context?: Record<string, any>) =>
  ErrorHandler.createAppError(error, context, { retryable: true });

export const createValidationError = (error: any, context?: Record<string, any>) =>
  ErrorHandler.createAppError(error, context, { retryable: false });

export const createAuthError = (error: any, context?: Record<string, any>) =>
  ErrorHandler.createAppError(error, context, { retryable: false });

export const createServerError = (error: any, context?: Record<string, any>) =>
  ErrorHandler.createAppError(error, context, { retryable: true }); 