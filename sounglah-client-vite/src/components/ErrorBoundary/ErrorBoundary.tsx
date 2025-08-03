import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import classes from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: Record<string, unknown>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Wrapper component to use hooks in class component
const ErrorBoundaryWrapper: React.FC<Props> = ({ children, fallback, onError, context }) => {
  const { handleError } = useErrorHandler();

  return (
    <ErrorBoundaryClass
      fallback={fallback}
      onError={onError}
      context={context}
      handleError={handleError}
    >
      {children}
    </ErrorBoundaryClass>
  );
};

interface ErrorBoundaryClassProps extends Props {
  handleError: (error: unknown, options?: Record<string, unknown>) => unknown;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryClassProps, State> {
  constructor(props: ErrorBoundaryClassProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Use standardized error handling
    this.props.handleError(error, {
      context: {
        ...this.props.context,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      showNotification: false, // Don't show notification for error boundary errors
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={classes.errorContainer}>
          <div className={classes.errorContent}>
            <h2 className={classes.errorTitle}>Something went wrong</h2>
            <p className={classes.errorMessage}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={classes.errorDetails}>
                <summary>Error Details (Development)</summary>
                <pre className={classes.errorStack}>
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button onClick={this.handleRetry} className={classes.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundaryWrapper as ErrorBoundary }; 