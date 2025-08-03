import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Container, Text, Title } from '@mantine/core';
import classes from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container className={classes.errorContainer}>
          <div className={classes.errorContent}>
            <Title order={2} className={classes.errorTitle}>
              Something went wrong
            </Title>
            <Text className={classes.errorMessage}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Text>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={classes.errorDetails}>
                <summary>Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <Button onClick={this.handleRetry} className={classes.retryButton}>
              Try Again
            </Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors
export const useAsyncError = () => {
  const [, setError] = React.useState();
  return React.useCallback(
    (e: Error) => {
      setError(() => {
        throw e;
      });
    },
    []
  );
}; 