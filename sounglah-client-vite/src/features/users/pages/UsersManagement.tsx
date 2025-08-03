import React, { useCallback, useMemo } from 'react';
import { SounglahTable } from '@/components/atoms/Table';
import { getUserTableColumns } from '../components/UsersManagement/userTableColumns';
import { CreateUserModal } from '../components/UsersManagement/CreateUserModal';
import { EditUserModal } from '../components/UsersManagement/EditUserModal';
import { DeleteConfirmationModal } from '@/components/atoms/DeleteConfirmationModal';
import { UserCardList } from '../components/UsersManagement/UserCardList';
import type { User } from '../api/users';
import classes from './UsersManagement.module.scss';
import { IconButton, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { AnimatePresence, motion } from 'framer-motion';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { UsersPageSkeleton, ErrorDisplay } from '@/components/atoms';
import { RoleManagementDrawer } from '../components/UsersManagement/RoleManagementDrawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { useModalState, useSelectionState, useErrorHandler } from '@/hooks';

export const UsersManagement: React.FC = () => {
  // Standardized modal state management
  const [createModalState, createModalHandlers] = useModalState();
  const [editModalState, editModalHandlers] = useModalState<User>();
  const [deleteModalState, deleteModalHandlers] = useModalState<User>();
  const [roleModalState, roleModalHandlers] = useModalState();
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isMediumScreen = useMediaQuery('(min-width: 780px) and (max-width: 890px)');

  // React Query hooks
  const { data: users = [], isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  // Standardized selection state management
  const [selectionState, selectionHandlers] = useSelectionState(users, [users]);

  // Standardized error handling
  const { handleAsyncError } = useErrorHandler();

  // Action handlers
  const handleEditClick = useCallback((user: User) => {
    editModalHandlers.openEdit(user);
  }, [editModalHandlers]);

  const handleDeleteClick = useCallback((user: User) => {
    deleteModalHandlers.openEdit(user);
  }, [deleteModalHandlers]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModalState.data) return;

    await handleAsyncError(
      async () => {
        await deleteUserMutation.mutateAsync(deleteModalState.data!.id);
        
        // Remove from selected IDs if it was selected
        selectionHandlers.selectItem(deleteModalState.data!.id, false);
        
        // Close the modal
        deleteModalHandlers.close();
      },
      {
        errorTitle: 'Failed to Delete User',
        errorDetail: 'Unable to delete the user. Please try again.',
        context: { userId: deleteModalState.data?.id, action: 'delete_user' },
      }
    );
  }, [deleteModalState.data, deleteUserMutation, deleteModalHandlers, selectionHandlers, handleAsyncError]);

  const handleDeleteCancel = useCallback(() => {
    deleteModalHandlers.close();
  }, [deleteModalHandlers]);

  const handleCreateSuccess = useCallback(() => {
    createModalHandlers.close();
  }, [createModalHandlers]);

  const handleEditSuccess = useCallback(() => {
    editModalHandlers.close();
  }, [editModalHandlers]);

  const handleCloseCreateModal = useCallback(() => {
    createModalHandlers.close();
  }, [createModalHandlers]);

  const handleCloseEditModal = useCallback(() => {
    editModalHandlers.close();
  }, [editModalHandlers]);

  // Table columns
  const userTableColumns = useMemo(() => 
    getUserTableColumns({
      selectedIds: selectionState.selectedIds,
      handleSelectRow: selectionHandlers.selectItem,
      selectAllChecked: selectionState.selectAllChecked,
      selectAllIndeterminate: selectionState.selectAllIndeterminate,
      handleSelectAll: selectionHandlers.selectAll,
      handleEditClick,
      handleDeleteClick,
      isMobile,
      isMediumScreen,
      actionsHeader: (
        <div className={classes.tableHeaderActions}>
          <Tooltip title="Add User">
            <span>
              <IconButton
                onClick={() => createModalHandlers.openAdd()}
                size="small"
                style={{ color: 'var(--mantine-color-brown-1)' }}
                aria-label="Add new user"
              >
                <PersonAddIcon style={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      ),
    }),
    [
      selectionState,
      selectionHandlers,
      handleEditClick,
      handleDeleteClick,
      isMobile,
      isMediumScreen,
      createModalHandlers,
    ]
  );

  // Loading state - show skeleton instead of full-screen loading
  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Users"
        message="Unable to load user data. Please check your connection and try again."
      />
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.title}>User Management</h1>
        <p className={classes.subtitle}>
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Desktop Add User Button */}
      {!isMobile && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <SounglahButton
            variant="primary"
            onClick={() => createModalHandlers.openAdd()}
            style={{ minWidth: 140, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
            aria-label="Add new user"
          >
            <PersonAddIcon style={{ fontSize: 22 }} />
            Add User
          </SounglahButton>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={classes.content}
      >
        {/* Render table on desktop, cards on mobile */}
        {!isMobile ? (
          <SounglahTable
            columns={userTableColumns}
            data={users}
            getRowKey={(user) => user.id}
            pagination={false}
            ariaLabel="Users table"
            emptyMessage="No users found."
          />
        ) : (
          <UserCardList
            users={users}
            selectedIds={selectionState.selectedIds}
            onSelectUser={selectionHandlers.selectItem}
            onEditUser={handleEditClick}
            onDeleteUser={handleDeleteClick}
          />
        )}
        
        {/* Floating Action Buttons - Mobile Only */}
        {isMobile && (
          <div className={classes.floatingActionButtons}>
            <Tooltip title="Add User" placement="left">
              <IconButton
                onClick={() => createModalHandlers.openAdd()}
                size="large"
                aria-label="Add User"
                className={classes.fab}
                style={{ backgroundColor: '#fb8c00', color: '#fff', width: 56, height: 56, boxShadow: '0 4px 12px rgba(251, 140, 0, 0.3)' }}
              >
                <PersonAddIcon style={{ fontSize: 32 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage Roles" placement="left">
              <IconButton
                onClick={() => roleModalHandlers.openAdd()}
                size="large"
                aria-label="Manage Roles"
                className={classes.fab}
                style={{ backgroundColor: '#078930', color: '#fff', width: 56, height: 56, boxShadow: '0 4px 12px rgba(7, 137, 48, 0.3)' }}
              >
                <AdminPanelSettingsIcon style={{ fontSize: 32 }} />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {createModalState.isOpen && (
          <CreateUserModal
            opened={createModalState.isOpen}
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateSuccess}
          />
        )}
        {editModalState.isOpen && editModalState.data && (
          <EditUserModal
            opened={editModalState.isOpen}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            user={editModalState.data}
          />
        )}
        {deleteModalState.isOpen && deleteModalState.data && (
          <DeleteConfirmationModal
            opened={deleteModalState.isOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Delete User"
            message="Are you sure you want to delete this user?"
            itemName={deleteModalState.data.username}
            itemType="user"
            loading={deleteUserMutation.isPending}
          />
        )}
        <RoleManagementDrawer open={roleModalState.isOpen} onClose={() => roleModalHandlers.close()} />
      </AnimatePresence>
    </div>
  );
}; 