import React from 'react';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import classes from './MobileActions.module.scss';

interface MobileActionsProps {
  onAddClick: () => void;
  onUploadClick: () => void;
  onFilterClick?: () => void;
  activeFilterCount?: number;
}

export const MobileActions: React.FC<MobileActionsProps> = ({
  onAddClick,
  onUploadClick,
  onFilterClick,
  activeFilterCount = 0,
}) => {
  return (
    <div className={classes.floatingActionButtons}>
      <Tooltip title={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`} placement="left">
        <IconButton
          onClick={onFilterClick}
          size="large"
          aria-label="Open Filters"
          className={classes.fab}
          style={{
            backgroundColor: '#6d4c41',
            color: '#fff',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(109, 76, 65, 0.3)',
            position: 'relative',
          }}
        >
          <FilterAltIcon style={{ fontSize: 32 }} />
          {activeFilterCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: '#d32f2f',
                color: '#fff',
                borderRadius: 10,
                padding: '0 6px',
                fontSize: 12,
                lineHeight: '18px',
                minWidth: 18,
                textAlign: 'center',
                fontWeight: 700,
              }}
              aria-label={`${activeFilterCount} active filters`}
            >
              {activeFilterCount}
            </span>
          )}
        </IconButton>
      </Tooltip>
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