import React, { useState } from 'react';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import { Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';

interface ActionIconsProps {
  onApprove: () => void;
  onDeny: () => void;
  disabledApprove?: boolean;
  disabledDeny?: boolean;
  rowId?: string | number; // For better ARIA labeling
}

const dialogStyles = {
  background: 'linear-gradient(135deg, #f5e1c6 0%, #fff4e5 100%)',
  borderRadius: 18,
  boxShadow: '0 8px 32px rgba(78, 59, 42, 0.13)',
  color: '#4e3b2a',
  padding: 0,
  minWidth: 340,
  fontFamily: 'Georgia, serif',
};

const headerStyles = {
  color: '#4e3b2a',
  fontWeight: 700,
  fontSize: '1.18rem',
  letterSpacing: '0.01em',
  padding: '1.1rem 1.5rem 1rem 1.5rem',
  margin: 0,
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  position: 'relative',
  background: 'transparent',
  fontFamily: 'Georgia, serif',
};

const accentBarStyles = {
  content: '""',
  display: 'block',
  height: 6,
  width: '100%',
  background: 'linear-gradient(90deg, #fb8c00 0%, #fde642 40%, #078930 100%)',
  position: 'absolute',
  left: 0,
  bottom: -6,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  opacity: 0.95,
};

const contentStyles = {
  color: '#4e3b2a',
  fontSize: '1.08rem',
  padding: '1.5rem 2rem 1.2rem 2rem',
  background: 'transparent',
  fontFamily: 'Georgia, serif',
};

const actionsStyles = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '1.2rem 2rem 1.5rem 2rem',
  background: 'transparent',
  borderBottomLeftRadius: 18,
  borderBottomRightRadius: 18,
};

export const ActionIcons = React.memo<ActionIconsProps>(({ 
  onApprove, 
  onDeny, 
  disabledApprove = false, 
  disabledDeny = false,
  rowId 
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const approveLabel = disabledApprove 
    ? `Approve translation ${rowId ? `#${rowId}` : ''} (already approved)`
    : `Approve translation ${rowId ? `#${rowId}` : ''}`;
    
  const denyLabel = disabledDeny 
    ? `Deny translation ${rowId ? `#${rowId}` : ''} (already denied)`
    : `Deny translation ${rowId ? `#${rowId}` : ''}`;

  const handleKeyDown = (event: React.KeyboardEvent, action: 'approve' | 'deny') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (action === 'approve' && !disabledApprove) {
        onApprove();
      } else if (action === 'deny' && !disabledDeny) {
        setConfirmOpen(true);
      }
    }
  };

  const handleDenyClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDeny = () => {
    setConfirmOpen(false);
    onDeny();
  };

  const handleCancelDeny = () => {
    setConfirmOpen(false);
  };

  return (
    <div 
      style={{ display: 'flex', gap: 8 }}
      role="group"
      aria-label={`Actions for translation ${rowId ? `#${rowId}` : ''}`}
    >
      <Tooltip title={approveLabel}>
        <span>
          <IconButton
            onClick={onApprove}
            disabled={disabledApprove}
            size="small"
            style={{ color: disabledApprove ? '#bdbdbd' : '#388e3c' }}
            aria-label={approveLabel}
            aria-describedby={disabledApprove ? 'approve-disabled-tooltip' : undefined}
            onKeyDown={(e) => handleKeyDown(e, 'approve')}
            tabIndex={disabledApprove ? -1 : 0}
          >
            <ThumbUpAltIcon aria-hidden="true" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={denyLabel}>
        <span>
          <IconButton
            onClick={handleDenyClick}
            disabled={disabledDeny}
            size="small"
            style={{ color: disabledDeny ? '#bdbdbd' : '#d32f2f' }}
            aria-label={denyLabel}
            aria-describedby={disabledDeny ? 'deny-disabled-tooltip' : undefined}
            onKeyDown={(e) => handleKeyDown(e, 'deny')}
            tabIndex={disabledDeny ? -1 : 0}
          >
            <ThumbDownAltIcon aria-hidden="true" />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDeny}
        aria-labelledby="confirm-deny-title"
        aria-describedby="confirm-deny-description"
        PaperProps={{
          style: dialogStyles,
        }}
      >
        <div style={{ position: 'relative' }}>
          <DialogTitle 
            id="confirm-deny-title" 
            sx={{
              ...headerStyles,
            }}
          >
            Confirm Rejection
            <span style={{ ...accentBarStyles, position: 'absolute', left: 0, right: 0, bottom: -6, height: 6, width: '100%' }} />
          </DialogTitle>
        </div>
        <DialogContent id="confirm-deny-description" style={contentStyles}>
          Are you sure you want to reject translation {rowId ? `#${rowId}` : ''}? This action cannot be undone.
        </DialogContent>
        <DialogActions style={actionsStyles}>
          <SounglahButton variant="secondary" onClick={handleCancelDeny} type="button">
            Cancel
          </SounglahButton>
          <SounglahButton variant="primary" onClick={handleConfirmDeny} type="button" style={{ background: '#d32f2f', color: '#fff4e5' }}>
            Confirm Reject
          </SounglahButton>
        </DialogActions>
      </Dialog>
    </div>
  );
});

ActionIcons.displayName = 'ActionIcons'; 