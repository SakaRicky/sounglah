import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import classes from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    if (!error) return;

    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In a real app, you'd send this to your error reporting service
    console.log('Error Report:', errorReport);
    
    // For now, we'll just show a message
    alert('Error report generated. Please contact support with the error details.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={classes.errorBoundary}>
          <div className={classes.errorContainer}>
            <div className={classes.errorIcon}>⚠️</div>
            <h1 className={classes.errorTitle}>Something went wrong</h1>
            <p className={classes.errorMessage}>
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={classes.errorDetails}>
                <summary>Error Details (Development)</summary>
                <div className={classes.errorStack}>
                  <h4>Error Message:</h4>
                  <pre>{this.state.error.message}</pre>
                  
                  <h4>Error Stack:</h4>
                  <pre>{this.state.error.stack}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                  
                  <h4>Error ID:</h4>
                  <code>{this.state.errorId}</code>
                </div>
              </details>
            )}
            
            <div className={classes.errorActions}>
              <SounglahButton
                variant="primary"
                onClick={this.handleRetry}
                className={classes.retryButton}
              >
                Try Again
              </SounglahButton>
              
              <SounglahButton
                variant="secondary"
                onClick={this.handleReload}
                className={classes.reloadButton}
              >
                Reload Page
              </SounglahButton>
              
              <SounglahButton
                variant="secondary"
                onClick={this.handleReportError}
                className={classes.reportButton}
              >
                Report Error
              </SounglahButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 