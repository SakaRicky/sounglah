import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SounglahTable } from '@/components/atoms/Table';
import { getUserTableColumns } from '../components/UsersManagement/userTableColumns';
import { CreateUserModal } from '../components/UsersManagement/CreateUserModal';
import { EditUserModal } from '../components/UsersManagement/EditUserModal';
import { UserCardList } from '../components/UsersManagement/UserCardList';
import { getUsers } from '../api/users';
import type { User } from '../api/users';
import classes from './UsersManagement.module.scss';
import { useNotification } from '@/contexts/NotificationContext';
import { IconButton, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { AnimatePresence, motion } from 'framer-motion';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { useState as useStateAlias } from 'react';
import { RoleManagementDrawer } from '../components/UsersManagement/RoleManagementDrawer';
import useMediaQuery from '@mui/material/useMediaQuery';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpened, setRoleModalOpened] = useStateAlias(false);
  const notify = useNotification();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isMediumScreen = useMediaQuery('(min-width: 780px) and (max-width: 890px)');

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      notify.notify({
        type: 'error',
        title: 'Failed to Load Users',
        detail: 'An error occurred while loading users.'
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Selection handlers
  const handleSelectRow = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(users.map(user => user.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [users]);

  const selectAllChecked = useMemo(() => {
    return users.length > 0 && selectedIds.size === users.length;
  }, [users.length, selectedIds.size]);

  const selectAllIndeterminate = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < users.length;
  }, [selectedIds.size, users.length]);

  // Action handlers
  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setEditModalOpened(true);
  }, []);

  const handleDeleteClick = useCallback((user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      // TODO: Implement delete user API call
      notify.notify({
        type: 'info',
        title: 'Delete User',
        detail: 'Delete user functionality will be implemented in the next phase.'
      });
    }
  }, [notify]);

  const handleCreateSuccess = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditSuccess = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpened(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpened(false);
    setSelectedUser(null);
  }, []);

  // Table columns
  const userTableColumns = useMemo(() => 
    getUserTableColumns({
      selectedIds,
      handleSelectRow,
      selectAllChecked,
      selectAllIndeterminate,
      handleSelectAll,
      handleEditClick,
      handleDeleteClick,
      isMobile,
      isMediumScreen,
      actionsHeader: (
        <div className={classes.tableHeaderActions}>
          <Tooltip title="Add User">
            <span>
              <IconButton
                onClick={() => setCreateModalOpened(true)}
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
    [selectedIds, handleSelectRow, selectAllChecked, selectAllIndeterminate, handleSelectAll, handleEditClick, handleDeleteClick, isMobile, isMediumScreen]
  );

  if (loading) {
    return (
      <div className={classes.container}>
        <LoadingSpinner 
          message="Loading users..." 
          size="large"
          fullHeight={false}
        />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={classes.header}
      >
        <h1 className={classes.title}>User Management</h1>
        <p className={classes.subtitle}>
          Manage system users, roles, and permissions
        </p>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <SounglahButton
            variant="secondary"
            onClick={() => setRoleModalOpened(true)}
            style={{ minWidth: 140, fontWeight: 600, fontSize: 15 }}
            aria-label="Manage roles"
          >
            Manage Roles
          </SounglahButton>
        </div>
      </motion.div>

      {/* Add User Button (desktop only, hidden on mobile by SCSS) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <SounglahButton
          variant="primary"
          onClick={() => setCreateModalOpened(true)}
          style={{ minWidth: 140, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
          aria-label="Add new user"
        >
          <PersonAddIcon style={{ fontSize: 22 }} />
          Add User
        </SounglahButton>
      </div>

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
            selectedIds={selectedIds}
            onSelectUser={handleSelectRow}
            onEditUser={handleEditClick}
            onDeleteUser={handleDeleteClick}
          />
        )}
        
        {/* Floating Action Buttons - Mobile Only */}
        {isMobile && (
          <div className={classes.floatingActionButtons}>
            <Tooltip title="Add User" placement="left">
              <IconButton
                onClick={() => setCreateModalOpened(true)}
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
                onClick={() => setRoleModalOpened(true)}
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
        {createModalOpened && (
          <CreateUserModal
            opened={createModalOpened}
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateSuccess}
          />
        )}
        {editModalOpened && selectedUser && (
          <EditUserModal
            opened={editModalOpened}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            user={selectedUser}
          />
        )}
        <RoleManagementDrawer open={roleModalOpened} onClose={() => setRoleModalOpened(false)} />
      </AnimatePresence>
    </div>
  );
}; 