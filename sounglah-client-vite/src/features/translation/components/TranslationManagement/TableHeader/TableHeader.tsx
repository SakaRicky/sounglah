import React from 'react';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import classes from './TableHeader.module.scss';

interface TableHeaderProps {
  onAddClick: () => void;
  onUploadClick: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  onAddClick,
  onUploadClick,
}) => {
  return (
    <div className={classes.tableHeaderActions}>
      <Tooltip title="Add Translation">
        <span>
          <IconButton
            onClick={onAddClick}
            size="large"
            aria-label="Add Translation"
            style={{
              color: '#fff',
              width: 44,
              height: 44,
              transition: 'color 0.18s, transform 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <AddCircleOutlineIcon style={{ fontSize: 30 }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Upload CSV">
        <span>
          <IconButton
            onClick={onUploadClick}
            size="large"
            aria-label="Upload CSV"
            style={{
              color: '#fff',
              width: 44,
              height: 44,
              transition: 'color 0.18s, transform 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <CloudUploadIcon style={{ fontSize: 30 }} />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
}; 