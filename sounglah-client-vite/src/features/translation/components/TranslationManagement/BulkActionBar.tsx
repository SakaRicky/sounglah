import React from 'react';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import classes from '@/features/translation/components/TranslationManagement/BulkActionBar.module.scss';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onApprove, onReject }) => (
  <div className={classes.bulkActionBar} role="region" aria-label="Bulk actions">
    <span className={classes.bulkActionCount}>
      {selectedCount} selected
    </span>
    <SounglahButton
      variant="primary"
      type="button"
      onClick={onApprove}
      style={{ marginRight: 8, minWidth: 0, padding: '0.3rem 0.9rem', fontSize: '0.95rem' }}
      aria-label="Bulk approve selected translations"
    >
      <DoneAllIcon style={{ fontSize: 18, marginRight: 4 }} />
      Bulk Approve
    </SounglahButton>
    <SounglahButton
      variant="secondary"
      type="button"
      onClick={onReject}
      style={{ minWidth: 0, padding: '0.3rem 0.9rem', fontSize: '0.95rem' }}
      aria-label="Bulk reject selected translations"
    >
      <BlockIcon style={{ fontSize: 18, marginRight: 4 }} />
      Bulk Reject
    </SounglahButton>
  </div>
); 