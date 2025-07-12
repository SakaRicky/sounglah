import React, { useState, useCallback, useEffect } from 'react';
import { IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import classes from './NotificationToast.module.scss';
import type { AppError } from '@/utils/errorHandling';

export interface NotificationToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  detail?: string;
  error?: AppError;
  onClose: (id: string) => void;
  onRetry?: () => void;
  onUndo?: () => void;
  autoClose?: boolean;
  duration?: number;
  persistent?: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  type,
  title,
  detail,
  error,
  onClose,
  onRetry,
  onUndo,
//   autoClose = true,
  duration = 5000,
  persistent = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(id), 300); // Allow animation to complete
  }, [id, onClose]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
      handleClose();
    }
  }, [onRetry, handleClose]);

  const handleUndo = useCallback(() => {
    if (onUndo) {
      onUndo();
      handleClose();
    }
  }, [onUndo, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={classes.successIcon} />;
      case 'error':
        return <ErrorIcon className={classes.errorIcon} />;
      case 'warning':
        return <WarningIcon className={classes.warningIcon} />;
      case 'info':
        return <InfoIcon className={classes.infoIcon} />;
      default:
        return <InfoIcon className={classes.infoIcon} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return classes.success;
      case 'error':
        return classes.error;
      case 'warning':
        return classes.warning;
      case 'info':
        return classes.info;
      default:
        return classes.info;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Info';
    }
  };

  const isRetryable = error && onRetry && type === 'error';
  const isUndoable = onUndo && (type === 'success' || type === 'warning');

  return (
    <Collapse in={!isClosing}>
      <div 
        className={`${classes.notificationToast} ${getTypeClass()} ${isVisible ? classes.visible : ''}`}
        data-type={type}
      >
        {/* Decorative border */}
        <div className={classes.borderAccent} />
        
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.iconContainer}>
            {getIcon()}
          </div>
          <div className={classes.titleSection}>
            <div className={classes.typeLabel}>{getTypeLabel()}</div>
            <h3 className={classes.title}>{title}</h3>
          </div>
          <div className={classes.actions}>
            {isUndoable && (
              <IconButton
                size="small"
                onClick={handleUndo}
                className={classes.undoButton}
                title="Undo action"
              >
                <UndoIcon />
              </IconButton>
            )}
            {isRetryable && (
              <IconButton
                size="small"
                onClick={handleRetry}
                className={classes.retryButton}
                title="Retry operation"
              >
                <RefreshIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleClose}
              className={classes.closeButton}
              title="Close notification"
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        
        {/* Content */}
        <div className={classes.content}>
          {detail && (
            <div className={classes.detail}>
              {detail}
            </div>
          )}

          {error && (
            <div className={classes.errorSection}>
              <button
                className={classes.expandButton}
                onClick={() => setIsExpanded(!isExpanded)}
                type="button"
                aria-expanded={isExpanded}
              >
                <span className={classes.expandIcon}>
                  {isExpanded ? '−' : '+'}
                </span>
                {isExpanded ? 'Hide' : 'Show'} Error Details
              </button>
              
              {isExpanded && (
                <div className={classes.errorDetails}>
                  <div className={classes.errorMessage}>
                    <strong>Error:</strong> {error.message}
                  </div>
                  
                  {error.recoverySuggestion && (
                    <div className={classes.recoverySuggestion}>
                      <strong>Suggestion:</strong> {error.recoverySuggestion}
                    </div>
                  )}
                  
                  {error.context && Object.keys(error.context).length > 0 && (
                    <details className={classes.errorContext}>
                      <summary>Context Information</summary>
                      <pre>{JSON.stringify(error.context, null, 2)}</pre>
                    </details>
                  )}
                  
                  <div className={classes.errorId}>
                    Error ID: <code>{error.id}</code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {!persistent && (
          <div className={classes.progressBar}>
            <div 
              className={classes.progressFill}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </Collapse>
  );
}; 