import React from 'react';
import { Tooltip } from '@mui/material';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

interface TableActionsProps {
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const TableActions: React.FC<TableActionsProps> = ({
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onExport,
  isExporting,
}) => {
  if (selectedCount > 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0 0 8px' }}>
        <Tooltip title="Bulk Approve Selected">
          <span>
            <SounglahButton
              variant="primary"
              onClick={onBulkApprove}
              style={{ minWidth: 0, padding: '2px 8px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
              aria-label="Bulk approve selected translations"
            >
              <ThumbUpAltIcon style={{ fontSize: 18, marginRight: 4 }} /> Bulk Approve
            </SounglahButton>
          </span>
        </Tooltip>
        <Tooltip title="Bulk Reject Selected">
          <span>
            <SounglahButton
              variant="secondary"
              onClick={onBulkReject}
              style={{ minWidth: 0, padding: '2px 8px', fontSize: 13, color: '#d32f2f', borderColor: '#d32f2f', display: 'flex', alignItems: 'center', gap: 4 }}
              aria-label="Bulk reject selected translations"
            >
              <ThumbDownAltIcon style={{ fontSize: 18, marginRight: 4 }} /> Bulk Reject
            </SounglahButton>
          </span>
        </Tooltip>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0 10px 12px', display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Export translations as CSV">
        <span>
          <SounglahButton
            variant="primary"
            onClick={onExport}
            style={{
              minWidth: 0,
              width: 48,
              height: 48,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Export translations as CSV"
            disabled={isExporting}
          >
            <CloudDownloadIcon style={{ fontSize: 28, margin: 0 }} />
          </SounglahButton>
        </span>
      </Tooltip>
    </div>
  );
}; 