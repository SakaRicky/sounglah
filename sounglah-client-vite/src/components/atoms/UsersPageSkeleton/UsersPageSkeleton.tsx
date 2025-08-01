import React from 'react';
import { Skeleton, Box } from '@mui/material';
import classes from './UsersPageSkeleton.module.scss';

export const UsersPageSkeleton: React.FC = () => {
  return (
    <div className={classes.container}>
      {/* Header Skeleton */}
      <div className={classes.header}>
        <Skeleton variant="text" width={250} height={40} />
        <Skeleton variant="text" width={350} height={20} />
      </div>

      {/* Add User Button Skeleton */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Skeleton variant="rectangular" width={140} height={48} />
      </Box>

      {/* Content Skeleton */}
      <div className={classes.content}>
        {/* Table Skeleton */}
        <div className={classes.tableContainer}>
          {/* Table Header */}
          <Box mb={2} pb={1} borderBottom={2} borderColor="divider">
            <Box display="grid" gridTemplateColumns="60px 1fr 1fr 120px 100px 120px" gap={2} alignItems="center">
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
            </Box>
          </Box>

          {/* Table Rows */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Box 
              key={index} 
              display="grid" 
              gridTemplateColumns="60px 1fr 1fr 120px 100px 120px" 
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
            </Box>
          ))}
        </div>

        {/* Floating Action Buttons Skeleton */}
        <div className={classes.floatingActionButtons}>
          <Skeleton variant="circular" width={56} height={56} />
          <Skeleton variant="circular" width={56} height={56} />
        </div>
      </div>
    </div>
  );
}; 