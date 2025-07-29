import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { motion } from 'framer-motion';
import { theme } from '@/theme';
import classes from './DeleteConfirmationModal.module.scss';

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  itemType?: string;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType = 'item',
  loading = false,
}) => {
  return (
    <Dialog
      open={opened}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 16,
          backgroundColor: theme?.colors?.brown?.[0] || '#faf9f6',
          border: `2px solid ${theme?.colors?.brown?.[2] || '#d4c4a8'}`,
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Box className={classes.titleContainer}>
            <WarningIcon className={classes.warningIcon} />
            <Typography variant="h6" component="span">
              {title}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <Box className={classes.messageContainer}>
            <Typography variant="body1" className={classes.message}>
              {message}
            </Typography>
            
            <Box className={classes.itemHighlight}>
              <DeleteIcon className={classes.deleteIcon} />
              <Typography variant="h6" component="span" className={classes.itemName}>
                "{itemName}"
              </Typography>
            </Box>
            
            <Typography variant="body2" className={classes.warningText}>
              This action cannot be undone and will permanently remove this {itemType} from the system.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          <SounglahButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            style={{ minWidth: 100 }}
          >
            Cancel
          </SounglahButton>
          
          <SounglahButton
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ 
              minWidth: 100,
              backgroundColor: '#d32f2f',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#b71c1c'
              }
            }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </SounglahButton>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
}; 