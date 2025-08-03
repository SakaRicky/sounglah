import React from 'react';
import { Skeleton, Box } from '@mui/material';

interface StatsSkeletonProps {
  count?: number;
}

export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ count = 3 }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            minWidth: 200,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      ))}
    </Box>
  );
}; 