import React from 'react';
import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import classes from './ErrorDisplay.module.scss';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  retryButtonText?: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showRetryButton = true,
  retryButtonText = 'Retry',
  className = '',
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`${classes.errorContainer} ${className}`}>
      <div className={classes.errorContent}>
        <h3 className={classes.errorTitle}>{title}</h3>
        <p className={classes.errorMessage}>{message}</p>
        {showRetryButton && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
            className={classes.retryButton}
          >
            {retryButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}; 