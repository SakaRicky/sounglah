import React from 'react';
import { Tooltip, Menu, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ScienceIcon from '@mui/icons-material/Science';
import classes from './TableHeader.module.scss';

interface TableHeaderProps {
  onAddClick: () => void;
  onUploadClick: () => void;
  onAugmentClick?: (payload: { sample: boolean; sample_size?: number }) => void;
  augmenting?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  onAddClick,
  onUploadClick,
  onAugmentClick,
  augmenting = false,
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);
  const handleSample = () => { onAugmentClick?.({ sample: true, sample_size: 50 }); closeMenu(); };
  const handleFull = () => { onAugmentClick?.({ sample: false }); closeMenu(); };
  return (
    <div className={classes.tableHeaderActions}>
      <Tooltip title="Run Augmentation Pipeline">
        <span>
          <IconButton
            onClick={openMenu}
            size="large"
            aria-label="Run augmentation"
            disabled={augmenting}
            style={{
              color: '#fff',
              width: 44,
              height: 44,
              transition: 'color 0.18s, transform 0.18s',
              opacity: augmenting ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {augmenting ? (
              <CircularProgress size={22} sx={{ color: '#fff' }} />
            ) : (
              <ScienceIcon style={{ fontSize: 30 }} />
            )}
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem onClick={handleSample} disabled={augmenting}>Sample (50)</MenuItem>
            <MenuItem onClick={handleFull} disabled={augmenting}>Full (all)</MenuItem>
          </Menu>
        </span>
      </Tooltip>
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