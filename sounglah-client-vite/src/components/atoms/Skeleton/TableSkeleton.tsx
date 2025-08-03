import React from 'react';
import { Skeleton, Box } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  height?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6,
  showHeader = true,
  showPagination = true,
  height = 'auto',
}) => {
  return (
    <Box sx={{ width: '100%', height }}>
      {/* Table Header */}
      {showHeader && (
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="100%" height={56} />
        </Box>
      )}

      {/* Table Rows */}
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={`${100 / columns}%`}
                height={20}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* Pagination */}
      {showPagination && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={200} height={20} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={32} height={32} />
            <Skeleton variant="rectangular" width={32} height={32} />
            <Skeleton variant="rectangular" width={32} height={32} />
          </Box>
        </Box>
      )}
    </Box>
  );
}; 