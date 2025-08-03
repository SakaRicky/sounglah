import { useState, useCallback } from 'react';
import { useBulkUpdateTranslations } from './useTranslations';
import { useNotification } from '@/contexts/NotificationContext';

export type BulkActionType = 'approve' | 'reject' | null;

export interface BulkActionState {
  bulkAction: BulkActionType;
  bulkDialogOpen: boolean;
  isProcessing: boolean;
}

export interface BulkActionHandlers {
  setBulkAction: (action: BulkActionType) => void;
  setBulkDialogOpen: (open: boolean) => void;
  handleBulkApprove: () => void;
  handleBulkReject: () => void;
  handleBulkDialogClose: () => void;
  handleBulkConfirm: () => void;
}

export const useBulkActions = (selectedIds: Set<number>) => {
  const [bulkAction, setBulkAction] = useState<BulkActionType>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  
  const bulkUpdateMutation = useBulkUpdateTranslations();
  const notify = useNotification();

  const handleBulkApprove = useCallback(() => {
    setBulkAction('approve');
    setBulkDialogOpen(true);
  }, []);

  const handleBulkReject = useCallback(() => {
    setBulkAction('reject');
    setBulkDialogOpen(true);
  }, []);

  const handleBulkDialogClose = useCallback(() => {
    setBulkDialogOpen(false);
    setBulkAction(null);
  }, []);

  const handleBulkConfirm = useCallback(async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    try {
      const translationIds = Array.from(selectedIds);
      const status = bulkAction === 'approve' ? 'approved' : 'rejected';
      
      await bulkUpdateMutation.mutateAsync({
        translation_ids: translationIds,
        action: status === 'approved' ? 'approve' : 'reject',
      });

      // Note: Success notification is handled by the mutation's onSuccess callback
      // Close dialog
      handleBulkDialogClose();
    } catch {
      // Error notification
      notify.notify({
        type: 'error',
        title: `Bulk ${bulkAction} failed`,
        detail: `Failed to ${bulkAction} translations. Please try again.`,
      });
    }
  }, [bulkAction, selectedIds, bulkUpdateMutation, notify, handleBulkDialogClose]);

  const bulkActionState: BulkActionState = {
    bulkAction,
    bulkDialogOpen,
    isProcessing: bulkUpdateMutation.isPending,
  };

  const bulkActionHandlers: BulkActionHandlers = {
    setBulkAction,
    setBulkDialogOpen,
    handleBulkApprove,
    handleBulkReject,
    handleBulkDialogClose,
    handleBulkConfirm,
  };

  return {
    bulkActionState,
    bulkActionHandlers,
  };
}; 