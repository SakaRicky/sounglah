import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';
import type { User, UpdateUserRequest } from '../../api/users';
import classes from './EditUserModal.module.scss';
import { theme } from '@/theme';
import { motion } from 'framer-motion';
import { useUpdateUser, useRoles } from '../../hooks/useUsers';

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export const EditUserModal = React.memo<EditUserModalProps>(({ 
  opened, 
  onClose, 
  onSuccess,
  user
}) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role_id: 0,
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
  });

  // React Query hooks
  const updateUserMutation = useUpdateUser();
  const { data: roles = [] } = useRoles();

  useEffect(() => {
    if (user && opened) {
      setForm({
        username: user.username,
        email: user.email,
        password: '', // Password is optional for updates
        role_id: 0, // Will be set when roles are loaded
      });
      setFormError('');
      setFieldErrors({ username: false, email: false });
    }
  }, [user, opened]);

  // Set current user's role_id when roles are loaded
  useEffect(() => {
    if (opened && user && roles.length > 0) {
      const currentRole = roles.find(role => role.name === user.role);
      setForm(f => ({ ...f, role_id: currentRole?.id || roles[0]?.id || 0 }));
    }
  }, [opened, user, roles]);

  const handleFormChange = useCallback((field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClose = useCallback(() => {
    setForm({ username: '', email: '', password: '', role_id: 0 });
    setFormError('');
    setFieldErrors({ username: false, email: false });
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Custom validation for required fields
    const newFieldErrors = {
      username: !form.username.trim(),
      email: !form.email.trim(),
    };
    setFieldErrors(newFieldErrors);
    
    if (Object.values(newFieldErrors).some(Boolean)) {
      setFormError('Please fill in all required fields before submitting.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!user) {
      setFormError('No user selected for editing.');
      return;
    }

    try {
      // Prepare update data (only include fields that have changed or password if provided)
      const updateData: UpdateUserRequest = {
        username: form.username.trim(),
        email: form.email.trim(),
        role_id: form.role_id,
      };

      // Only include password if it's provided
      if (form.password.trim()) {
        updateData.password = form.password.trim();
      }

      await updateUserMutation.mutateAsync({ id: user.id, data: updateData });
      
      handleClose();
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to update user:', error);
    }
  }, [form, user, updateUserMutation, handleClose, onSuccess]);

  const roleOptions = useMemo(() => 
    roles.map(role => ({
      value: role.id.toString(),
      label: role.name,
      description: role.description
    })), 
    [roles]
  );

  if (!user) {
    return null;
  }

  return (
    <Dialog 
      open={opened} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 16,
          backgroundColor: theme?.colors?.brown?.[0] || '#faf9f6',
          border: `2px solid ${theme?.colors?.brown?.[2] || '#d4c4a8'}`,
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Edit User: {user.username}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent className={classes.dialogContent}>
            {formError && (
              <div className={classes.errorMessage}>
                {formError}
              </div>
            )}
            
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              fullWidth
              margin="normal"
              error={fieldErrors.username}
              helperText={fieldErrors.username ? 'Username is required' : ''}
              className={classes.textField}
            />
            
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              fullWidth
              margin="normal"
              error={fieldErrors.email}
              helperText={fieldErrors.email ? 'Valid email is required' : ''}
              className={classes.textField}
            />
            
            <TextField
              label="Password (leave blank to keep current)"
              type="password"
              value={form.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              fullWidth
              margin="normal"
              helperText="Only fill this if you want to change the password"
              className={classes.textField}
            />
            
            <SounglahSelect
              id="role"
              placeholder="Select role"
              data={roleOptions}
              value={form.role_id ? form.role_id.toString() : ''}
              onChange={(val) => handleFormChange('role_id', Number(val))}
              backgroundColor={theme?.colors?.beige?.[3] || '#FFF2DF'}
              className={classes.selectField}
            />
          </DialogContent>
          
          <DialogActions className={classes.dialogActions}>
            <SounglahButton
              variant="secondary"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
              style={{ minWidth: 100 }}
            >
              Cancel
            </SounglahButton>
            
            <SounglahButton
              variant="primary"
              type="submit"
              disabled={updateUserMutation.isPending}
              style={{ minWidth: 100 }}
            >
              {updateUserMutation.isPending ? (
                <CircularProgress size={20} style={{ color: 'white' }} />
              ) : (
                'Update User'
              )}
            </SounglahButton>
          </DialogActions>
        </form>
      </motion.div>
    </Dialog>
  );
}); 