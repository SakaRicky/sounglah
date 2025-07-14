import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SounglahTable } from '@/components/atoms/Table';
import { getUserTableColumns } from '../components/UsersManagement/userTableColumns';
import { CreateUserModal } from '../components/UsersManagement/CreateUserModal';
import { getUsers } from '../api/users';
import type { User } from '../api/users';
import classes from './UsersManagement.module.scss';
import { useNotification } from '@/contexts/NotificationContext';
import { IconButton, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AnimatePresence, motion } from 'framer-motion';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { useState as useStateAlias } from 'react';
import { RoleManagementDrawer } from '../components/UsersManagement/RoleManagementDrawer';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [roleModalOpened, setRoleModalOpened] = useStateAlias(false);
  const notify = useNotification();

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
    console.log("🚀 ~ handleEditClick ~ user:", user)
    // TODO: Implement edit user functionality
    notify.notify({
      type: 'info',
      title: 'Edit User',
      detail: 'Edit user functionality will be implemented in the next phase.'
    });
  }, [notify]);

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

  const handleCloseModal = useCallback(() => {
    setCreateModalOpened(false);
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
    [selectedIds, handleSelectRow, selectAllChecked, selectAllIndeterminate, handleSelectAll, handleEditClick, handleDeleteClick]
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

      {/* Add User Button */}
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
        <SounglahTable
          columns={userTableColumns}
          data={users}
          getRowKey={(user) => user.id}
          pagination={false}
          ariaLabel="Users table"
          emptyMessage="No users found."
        />
      </motion.div>

      <AnimatePresence>
        {createModalOpened && (
          <CreateUserModal
            opened={createModalOpened}
            onClose={handleCloseModal}
            onSuccess={handleCreateSuccess}
          />
        )}
        <RoleManagementDrawer open={roleModalOpened} onClose={() => setRoleModalOpened(false)} />
      </AnimatePresence>
    </div>
  );
}; 