import React from 'react';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import classes from './MobileActions.module.scss';

interface MobileActionsProps {
  onAddClick: () => void;
  onUploadClick: () => void;
}

export const MobileActions: React.FC<MobileActionsProps> = ({
  onAddClick,
  onUploadClick,
}) => {
  return (
    <div className={classes.floatingActionButtons}>
      <Tooltip title="Add Translation" placement="left">
        <IconButton
          onClick={onAddClick}
          size="large"
          aria-label="Add Translation"
          className={classes.fab}
          style={{
            backgroundColor: '#fb8c00',
            color: '#fff',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(251, 140, 0, 0.3)',
          }}
        >
          <AddCircleOutlineIcon style={{ fontSize: 32 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Upload CSV" placement="left">
        <IconButton
          onClick={onUploadClick}
          size="large"
          aria-label="Upload CSV"
          className={classes.fab}
          style={{
            backgroundColor: '#078930',
            color: '#fff',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(7, 137, 48, 0.3)',
          }}
        >
          <CloudUploadIcon style={{ fontSize: 32 }} />
        </IconButton>
      </Tooltip>
    </div>
  );
}; 