import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { NotificationToast } from '@/components/atoms/NotificationToast';
import type { AppError } from '@/utils/errorHandling';
import styles from './Notification.module.scss';

interface NotificationOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  detail?: string;
  error?: AppError;
  onRetry?: () => void;
  onUndo?: () => void;
  persistent?: boolean;
  duration?: number;
}

interface NotificationItem extends NotificationOptions {
  id: string;
  timestamp: number;
}

const NotificationContext = createContext<{
  notify: (opts: NotificationOptions) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
} | undefined>(undefined);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const nextId = useRef(1);

  const notify = useCallback((opts: NotificationOptions): string => {
    const id = `notification-${nextId.current++}`;
    const notification: NotificationItem = {
      ...opts,
      id,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove non-persistent notifications
    if (!opts.persistent) {
      const duration = opts.duration || (opts.type === 'error' ? 8000 : 5000);
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleRetry = useCallback((id: string, retryFn?: () => void) => {
    if (retryFn) {
      retryFn();
    }
    removeNotification(id);
  }, [removeNotification]);

  const handleUndo = useCallback((id: string, undoFn?: () => void) => {
    if (undoFn) {
      undoFn();
    }
    removeNotification(id);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notify, removeNotification, clearAll }}>
      {children}
      
      {/* Notification Container */}
      <div className={styles.notificationContainer}>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            detail={notification.detail}
            error={notification.error}
            onClose={removeNotification}
            onRetry={notification.onRetry ? () => handleRetry(notification.id, notification.onRetry) : undefined}
            onUndo={notification.onUndo ? () => handleUndo(notification.id, notification.onUndo) : undefined}
            persistent={notification.persistent}
            duration={notification.duration}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
} 