import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, TextField } from '@mui/material';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { DeleteConfirmationModal } from '@/components/atoms/DeleteConfirmationModal';
import { getRoles, createRole, updateRole, deleteRole } from '../../api/users';
import type { Role } from '../../api/users';
import { useNotification } from '@/contexts/NotificationContext';
import { theme } from '@/theme';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';

interface RoleManagementDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const RoleManagementDrawer: React.FC<RoleManagementDrawerProps> = ({ open, onClose }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState({ name: '', description: '' });
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const notify = useNotification();

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.roles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      notify.notify({
        type: 'error',
        title: 'Failed to Load Roles',
        detail: 'An error occurred while loading roles.'
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleAddRole = async () => {
    if (!newRole.name.trim()) {
      notify.notify({ type: 'error', title: 'Validation Error', detail: 'Role name is required.' });
      return;
    }

    try {
      await createRole({ name: newRole.name.trim(), description: newRole.description.trim() });
      setNewRole({ name: '', description: '' });
      setAddMode(false);
      fetchRoles();
      notify.notify({ type: 'success', title: 'Role Created', detail: 'Role created successfully.' });
    } catch (err: unknown) {
      let errorMsg = 'Could not create role.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        errorMsg = String((err.response as { error?: string }).error) || errorMsg;
      }
      notify.notify({ type: 'error', title: 'Failed to Create Role', detail: errorMsg });
    }
  };

  const handleEditClick = (role: Role) => {
    setEditRoleId(role.id);
    setEditRole({ name: role.name, description: role.description || '' });
  };

  const handleEditSave = async (roleId: number) => {
    if (!editRole.name.trim()) {
      notify.notify({ type: 'error', title: 'Validation Error', detail: 'Role name is required.' });
      return;
    }

    try {
      await updateRole(roleId, { name: editRole.name.trim(), description: editRole.description.trim() });
      setEditRoleId(null);
      setEditRole({ name: '', description: '' });
      fetchRoles();
      notify.notify({ type: 'success', title: 'Role Updated', detail: 'Role updated successfully.' });
    } catch (err: unknown) {
      let errorMsg = 'Could not update role.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        errorMsg = String((err.response as { error?: string }).error) || errorMsg;
      }
      notify.notify({ type: 'error', title: 'Failed to Update Role', detail: errorMsg });
    }
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteModalOpened(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteRole(roleToDelete.id);
      setDeleteModalOpened(false);
      setRoleToDelete(null);
      fetchRoles();
      notify.notify({ type: 'success', title: 'Role Deleted', detail: 'Role deleted successfully.' });
    } catch (err: unknown) {
      let errorMsg = 'Could not delete role.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        errorMsg = String((err.response as { error?: string }).error) || errorMsg;
      }
      notify.notify({ type: 'error', title: 'Failed to Delete Role', detail: errorMsg });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpened(false);
    setRoleToDelete(null);
    setDeleteLoading(false);
  };

  const handleEditCancel = () => {
    setEditRoleId(null);
    setEditRole({ name: '', description: '' });
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            width: 400,
            padding: 0,
            background: theme.colors?.beige?.[0] || '#FFF4E5',
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: '0 8px 32px rgba(180, 138, 74, 0.12), 0 1.5px 4px rgba(180, 138, 74, 0.06)',
            border: `2px solid ${theme.colors?.brown?.[2] || '#e0c9a6'}`,
          }
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 24px 16px 24px',
          borderBottom: `1.5px solid ${theme.colors?.brown?.[2] || '#e0c9a6'}`,
          background: theme.colors?.beige?.[1] || '#FFF2DF',
          borderTopLeftRadius: 16,
        }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: theme.colors?.brown?.[8] || '#6d4c1b',
            letterSpacing: 0.5,
          }}>Role Management</span>
          <IconButton onClick={onClose} style={{ color: theme.colors?.brown?.[5] || '#b48a4a' }}><CloseIcon /></IconButton>
        </div>
        <div style={{ padding: 24 }}>
          <SounglahButton
            variant={addMode ? 'secondary' : 'primary'}
            onClick={() => setAddMode((m) => !m)}
            style={{ marginBottom: 16, fontWeight: 600, fontSize: 15, minWidth: 120 }}
          >
            <AddIcon style={{ marginRight: 8, fontSize: 20 }} />
            {addMode ? 'Cancel' : 'Add Role'}
          </SounglahButton>
          {addMode && (
            <div style={{ marginBottom: 24 }}>
              <TextField
                label="Role Name"
                value={newRole.name}
                onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
                fullWidth
                style={{ marginBottom: 12 }}
              />
              <TextField
                label="Description"
                value={newRole.description}
                onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))}
                fullWidth
                style={{ marginBottom: 12 }}
              />
              <SounglahButton
                variant="primary"
                onClick={handleAddRole}
                style={{ width: '100%', fontWeight: 600, fontSize: 15 }}
              >
                <SaveIcon style={{ marginRight: 8, fontSize: 20 }} />
                Save Role
              </SounglahButton>
            </div>
          )}
          <List>
            {roles.map(role => (
              <ListItem key={role.id} divider style={{ borderColor: theme.colors?.brown?.[2] || '#e0c9a6', padding: '12px 0' }}>
                {editRoleId === role.id ? (
                  <>
                    <TextField
                      value={editRole.name}
                      onChange={e => setEditRole(r => ({ ...r, name: e.target.value }))}
                      size="small"
                      label="Role Name"
                      style={{ marginRight: 8, width: 120 }}
                    />
                    <TextField
                      value={editRole.description}
                      onChange={e => setEditRole(r => ({ ...r, description: e.target.value }))}
                      size="small"
                      label="Description"
                      style={{ marginRight: 8, width: 120 }}
                    />
                    <IconButton size="small" style={{ color: theme.colors?.brown?.[6] || '#a06a1a' }} onClick={() => handleEditSave(role.id)}><CheckIcon /></IconButton>
                    <IconButton size="small" style={{ color: theme.colors?.brown?.[4] || '#b48a4a' }} onClick={handleEditCancel}><CancelIcon /></IconButton>
                  </>
                ) : (
                  <>
                    <ListItemText
                      primary={<span style={{ fontWeight: 600, color: theme.colors?.brown?.[8] || '#6d4c1b', fontFamily: 'Georgia, serif' }}>{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</span>}
                      secondary={<span style={{ color: theme.colors?.brown?.[5] || '#b48a4a', fontFamily: 'Georgia, serif' }}>{role.description}</span>}
                    />
                    <IconButton size="small" style={{ color: theme.colors?.brown?.[6] || '#a06a1a' }} onClick={() => handleEditClick(role)}><EditIcon /></IconButton>
                    <IconButton size="small" style={{ color: '#d32f2f' }} onClick={() => handleDeleteClick(role)}><DeleteIcon /></IconButton>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>

      {deleteModalOpened && roleToDelete && (
        <DeleteConfirmationModal
          opened={deleteModalOpened}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Role"
          message="Are you sure you want to delete this role?"
          itemName={roleToDelete.name}
          itemType="role"
          loading={deleteLoading}
        />
      )}
    </>
  );
}; 