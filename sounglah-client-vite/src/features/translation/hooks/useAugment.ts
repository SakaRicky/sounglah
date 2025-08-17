import { useCallback, useEffect, useRef, useState } from 'react';
import { getRun, startAugment, type RunStatusResponse, type StartRunPayload } from '../features/augment/api';
import { useNotification } from '@/contexts/NotificationContext';

export interface AugmentState {
  running: boolean;
  runId?: string;
  status?: RunStatusResponse['status'];
  metrics?: RunStatusResponse['metrics'];
  artifactPath?: string;
  error?: string;
}

export const useAugment = () => {
  const [state, setState] = useState<AugmentState>({ running: false });
  const timerRef = useRef<number | null>(null);
  const notify = useNotification();

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const poll = useCallback(async (runId: string) => {
    try {
      const data = await getRun(runId);
      setState(prev => ({
        ...prev,
        status: data.status,
        metrics: data.metrics,
        artifactPath: data.artifact_path,
        error: data.error,
      }));
      if (data.status === 'succeeded' || data.status === 'failed') {
        clearTimer();
        notify.notify({
          type: data.status === 'succeeded' ? 'success' : 'error',
          title: data.status === 'succeeded' ? 'Augmentation Succeeded' : 'Augmentation Failed',
          detail: data.status === 'succeeded' ?
            `Exported ${data.metrics?.exported ?? 0}, Clean ${data.metrics?.clean ?? 0}.` :
            (data.error || 'Unknown error'),
        });
        setState(prev => ({ ...prev, running: false }));
      }
    } catch (e) {
      // Log and stop polling
      // eslint-disable-next-line no-console
      console.error('Augment polling error:', e);
      clearTimer();
      setState(prev => ({ ...prev, running: false, error: 'Polling error' }));
    }
  }, [notify]);

  const start = useCallback(async (payload?: StartRunPayload) => {
    try {
      setState({ running: true });
      const { runId } = await startAugment(payload);
      setState({ running: true, runId, status: 'queued' });
      // Poll every 1500ms
      timerRef.current = window.setInterval(() => {
        poll(runId);
      }, 1500);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to start augmentation:', e);
      setState({ running: false, error: 'Failed to start augment' });
    }
  }, [poll]);

  useEffect(() => () => clearTimer(), []);

  return { state, start };
};


