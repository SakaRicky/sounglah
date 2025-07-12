import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { ErrorHandler } from '@/utils/errorHandling';

export const NotificationTest: React.FC = () => {
  const notify = useNotification();

  const testSuccess = () => {
    notify.notify({
      type: 'success',
      title: 'Translation Approved',
      detail: 'Translation #123 has been successfully approved and is now live.',
    });
  };

  const testError = () => {
    const testError = new Error('Failed to connect to the translation service');
    const appError = ErrorHandler.createAppError(testError, {
      operation: 'testOperation',
      userId: 'user123',
      timestamp: new Date().toISOString(),
    });

    notify.notify({
      type: 'error',
      title: 'Connection Failed',
      detail: 'Unable to connect to the translation service. Please check your internet connection.',
      error: appError,
      onRetry: () => {
        console.log('Retrying connection...');
        // Simulate retry
        setTimeout(() => {
          notify.notify({
            type: 'success',
            title: 'Connection Restored',
            detail: 'Successfully reconnected to the translation service.',
          });
        }, 1000);
      },
      persistent: true,
    });
  };

  const testWarning = () => {
    notify.notify({
      type: 'warning',
      title: 'Large File Upload',
      detail: 'You are uploading a file larger than 10MB. This may take several minutes to process.',
      duration: 8000,
    });
  };

  const testInfo = () => {
    notify.notify({
      type: 'info',
      title: 'New Feature Available',
      detail: 'Bulk translation upload is now available. Try uploading a CSV file with multiple translations.',
      duration: 6000,
    });
  };

  const testValidationError = () => {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    const appError = ErrorHandler.createAppError(validationError, {
      field: 'source_text',
      value: '',
      validation: 'required',
    });

    notify.notify({
      type: 'error',
      title: 'Invalid Input',
      detail: 'Please fill in all required fields before submitting.',
      error: appError,
      persistent: false,
    });
  };

  const testNetworkError = () => {
    const networkError = new Error('Network request failed');
    networkError.name = 'NetworkError';
    const appError = ErrorHandler.createAppError(networkError, {
      endpoint: '/api/translations',
      method: 'GET',
      status: 0,
    });

    notify.notify({
      type: 'error',
      title: 'Network Error',
      detail: 'Unable to reach the server. Please check your internet connection.',
      error: appError,
      onRetry: () => {
        console.log('Retrying network request...');
        setTimeout(() => {
          notify.notify({
            type: 'success',
            title: 'Connection Restored',
            detail: 'Network connection has been restored.',
          });
        }, 1500);
      },
      persistent: true,
    });
  };

  const testMultipleNotifications = () => {
    // Show multiple notifications at once
    testSuccess();
    setTimeout(() => testWarning(), 500);
    setTimeout(() => testInfo(), 1000);
    setTimeout(() => testError(), 1500);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'var(--color-beige-0)', 
      minHeight: '100vh',
      fontFamily: 'Georgia, serif'
    }}>
      <h1 style={{ color: 'var(--color-brown-9)', marginBottom: '2rem' }}>
        Notification Toast Test
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <SounglahButton variant="primary" onClick={testSuccess}>
          Test Success
        </SounglahButton>
        
        <SounglahButton variant="primary" onClick={testError}>
          Test Error (with Retry)
        </SounglahButton>
        
        <SounglahButton variant="primary" onClick={testWarning}>
          Test Warning
        </SounglahButton>
        
        <SounglahButton variant="primary" onClick={testInfo}>
          Test Info
        </SounglahButton>
        
        <SounglahButton variant="primary" onClick={testValidationError}>
          Test Validation Error
        </SounglahButton>
        
        <SounglahButton variant="primary" onClick={testNetworkError}>
          Test Network Error
        </SounglahButton>
        
        <SounglahButton variant="secondary" onClick={testMultipleNotifications}>
          Test Multiple
        </SounglahButton>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '12px',
        border: '2px solid var(--color-brown-3)'
      }}>
        <h3 style={{ color: 'var(--color-brown-8)', marginBottom: '1rem' }}>
          Features to Test:
        </h3>
        <ul style={{ color: 'var(--color-brown-7)', lineHeight: '1.6' }}>
          <li>✅ <strong>Custom Design:</strong> Unique styling with gradients and animations</li>
          <li>✅ <strong>Type Labels:</strong> Color-coded badges for each notification type</li>
          <li>✅ <strong>Progress Bar:</strong> Visual countdown for auto-dismiss</li>
          <li>✅ <strong>Hover Effects:</strong> Subtle animations on hover</li>
          <li>✅ <strong>Error Details:</strong> Expandable error information</li>
          <li>✅ <strong>Retry Functionality:</strong> One-click retry for errors</li>
          <li>✅ <strong>Mobile Responsive:</strong> Optimized for all screen sizes</li>
          <li>✅ <strong>Smooth Animations:</strong> Slide-in and fade effects</li>
          <li>✅ <strong>Accessibility:</strong> Screen reader friendly</li>
        </ul>
      </div>
    </div>
  );
}; 