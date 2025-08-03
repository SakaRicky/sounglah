import React from 'react';
import { Skeleton, Box } from '@mui/material';

interface FiltersSkeletonProps {
  filterCount?: number;
  showChips?: boolean;
}

export const FiltersSkeleton: React.FC<FiltersSkeletonProps> = ({
  filterCount = 5,
  showChips = true,
}) => {
  return (
    <Box>
      {/* Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {Array.from({ length: filterCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={150}
            height={40}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>

      {/* Filter Chips */}
      {showChips && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={80 + index * 20}
              height={32}
              sx={{ borderRadius: 16 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}; 