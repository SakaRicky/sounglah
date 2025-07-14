import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { theme } from '@/theme';
import classes from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullHeight = false 
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  };

  const getMessageSize = (): 'body2' | 'body1' | 'h6' => {
    switch (size) {
      case 'small': return 'body2';
      case 'large': return 'h6';
      default: return 'body1';
    }
  };

  return (
    <Box 
      className={`${classes.loadingContainer} ${fullHeight ? classes.fullHeight : ''}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        background: `linear-gradient(135deg, ${theme.colors?.beige?.[0] || '#FFF4E5'} 0%, ${theme.colors?.beige?.[1] || '#FFF2DF'} 100%)`,
        borderRadius: 2,
        padding: 3,
        minHeight: fullHeight ? '100vh' : '400px',
        width: '100%',
        boxShadow: `0 8px 32px rgba(${theme.colors?.brown?.[5] || '#b48a4a'}, 0.12), 0 1.5px 4px rgba(${theme.colors?.brown?.[5] || '#b48a4a'}, 0.06)`,
        border: `2px solid ${theme.colors?.brown?.[2] || '#e0c9a6'}`,
      }}
    >
      <CircularProgress 
        size={getSpinnerSize()}
        thickness={4}
        sx={{
          color: theme.colors?.brown?.[5] || '#b48a4a',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography
        variant={getMessageSize()}
        sx={{
          color: theme.colors?.brown?.[6] || '#8b6f3d',
          fontFamily: 'Georgia, serif',
          fontWeight: 500,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}; 