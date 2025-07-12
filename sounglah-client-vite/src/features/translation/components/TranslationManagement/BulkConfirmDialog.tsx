import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Box } from '@mui/material';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import classes from '@/features/translation/components/TranslationManagement/BulkConfirmDialog.module.scss';

interface BulkConfirmDialogProps {
  open: boolean;
  actionType: 'approve' | 'reject';
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
  processing?: boolean;
}

export const BulkConfirmDialog: React.FC<BulkConfirmDialogProps> = ({ open, actionType, count, onCancel, onConfirm, processing }) => (
  <Dialog
    open={open}
    onClose={processing ? undefined : onCancel}
    aria-labelledby="bulk-action-dialog-title"
    classes={{ paper: classes.dialogPaper }}
  >
    <DialogTitle id="bulk-action-dialog-title" className={classes.dialogTitle}>
      Confirm Bulk {actionType === 'approve' ? 'Approve' : 'Reject'}
    </DialogTitle>
    <DialogContent className={classes.dialogContent}>
      {processing ? (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={24} />
          <span>Processing...</span>
        </Box>
      ) : (
        <>Are you sure you want to {actionType} {count} translation{count !== 1 ? 's' : ''}?</>
      )}
    </DialogContent>
    <DialogActions className={classes.dialogActions}>
      <SounglahButton variant="secondary" onClick={onCancel} disabled={!!processing}>
        Cancel
      </SounglahButton>
      <SounglahButton variant="primary" onClick={onConfirm} disabled={!!processing}>
        Confirm
      </SounglahButton>
    </DialogActions>
  </Dialog>
); 