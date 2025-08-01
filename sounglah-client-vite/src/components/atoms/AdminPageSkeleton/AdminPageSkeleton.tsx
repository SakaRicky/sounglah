import React from 'react';
import { Skeleton, Box } from '@mui/material';
import classes from './AdminPageSkeleton.module.scss';

export const AdminPageSkeleton: React.FC = () => {
  return (
    <div className={classes.pageBg}>
      {/* Segmented Control Skeleton */}
      <div className={classes.segmentedControl}>
        <Box display="flex" gap={1}>
          <Skeleton variant="rectangular" width={120} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
      </div>

      {/* Header Skeleton */}
      <div className={classes.header}>
        <Skeleton variant="text" width={300} height={40} />
      </div>

      {/* Stats Cards Skeleton */}
      <div className={classes.statsContainer}>
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} className={classes.statCard}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          ))}
        </Box>
      </div>

      {/* Filters Row Skeleton */}
      <div className={classes.filtersRow}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Skeleton variant="rectangular" width={120} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
      </div>

      {/* Filter Chips Skeleton */}
      <div className={classes.filterChips}>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} />
          <Skeleton variant="rectangular" width={90} height={32} />
        </Box>
      </div>

      {/* Table Skeleton */}
      <div className={classes.tableContainer}>
        {/* Table Header */}
        <Box mb={2} pb={1} borderBottom={2} borderColor="divider">
          <Box display="grid" gridTemplateColumns="60px 1fr 1fr 100px 100px 120px 100px" gap={2} alignItems="center">
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
          </Box>
        </Box>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, index) => (
          <Box 
            key={index} 
            display="grid" 
            gridTemplateColumns="60px 1fr 1fr 100px 100px 120px 100px" 
            gap={2} 
            alignItems="center"
            py={1}
            borderBottom={1}
            borderColor="divider"
          >
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
          </Box>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className={classes.pagination}>
        <Skeleton variant="rectangular" width={200} height={40} />
      </div>
    </div>
  );
}; 