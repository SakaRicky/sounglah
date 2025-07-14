import React, { useState, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';
import { createUser, getRoles } from '../../api/users';
import type { Role } from '../../api/users';
import { AxiosError } from 'axios';
import classes from './CreateUserModal.module.scss';
import { theme } from '@/theme';
import { useNotification } from '@/contexts/NotificationContext';
import { motion } from 'framer-motion';

interface CreateUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal = React.memo<CreateUserModalProps>(({ 
  opened, 
  onClose, 
  onSuccess
}) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role_id: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const notify = useNotification();
  const [roles, setRoles] = useState<Role[]>([]);
  // removed unused rolesLoading

  React.useEffect(() => {
    if (opened) {
      getRoles()
        .then(res => {
          setRoles(res.roles);
          // Set default role_id to first role if not set
          setForm(f => ({ ...f, role_id: res.roles[0]?.id || 0 }));
        })
        .catch(() => setRoles([]));
    }
  }, [opened]);

  const handleFormChange = useCallback((field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClose = useCallback(() => {
    setForm({ username: '', email: '', password: '', role_id: 0 });
    setFormError('');
    setFormLoading(false);
    setFieldErrors({ username: false, email: false, password: false });
    setHasSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError('');
    
    // Custom validation for required fields
    const newFieldErrors = {
      username: !form.username.trim(),
      email: !form.email.trim(),
      password: !form.password.trim(),
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

    setFormLoading(true);
    try {
      await createUser({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role_id: form.role_id,
      });
      handleClose();
      notify.notify({
        type: 'success',
        title: 'User Added',
        detail: 'The user was created successfully.'
      });
      onSuccess();
    } catch (err) {
      if (err instanceof AxiosError) {
        setFormError(err.response?.data?.error || 'Failed to create user.');
        notify.notify({
          type: 'error',
          title: 'Failed to Add User',
          detail: err.response?.data?.error || 'An error occurred while creating the user.'
        });
      } else {
        setFormError('Failed to create user.');
        notify.notify({
          type: 'error',
          title: 'Failed to Add User',
          detail: 'An error occurred while creating the user.'
        });
      }
    } finally {
      setFormLoading(false);
    }
  }, [form, handleClose, notify, onSuccess]);

  // Memoize role options from API
  const roleOptions = React.useMemo(() =>
    roles.map(r => ({ value: r.id.toString(), label: r.name.charAt(0).toUpperCase() + r.name.slice(1) })),
    [roles]
  );

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return form.username.trim() && 
           form.email.trim() && 
           form.password.trim() &&
           !!form.role_id;
  }, [form]);

  return (
    <Dialog 
      open={opened} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 12,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle className={classes.modalHeader}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={classes.modalTitle}
        >
          Add New User
        </motion.div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className={classes.content}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TextField
              label="Username *"
              placeholder="Enter username"
              value={form.username}
              onChange={e => handleFormChange('username', e.target.value)}
              error={hasSubmitted && fieldErrors.username}
              variant="outlined"
              className={classes.textField}
            />
            <TextField
              label="Email *"
              placeholder="Enter email address"
              type="email"
              value={form.email}
              onChange={e => handleFormChange('email', e.target.value)}
              error={hasSubmitted && fieldErrors.email}
              variant="outlined"
              className={classes.textField}
            />
            <TextField
              label="Password *"
              placeholder="Enter password"
              type="password"
              value={form.password}
              onChange={e => handleFormChange('password', e.target.value)}
              error={hasSubmitted && fieldErrors.password}
              variant="outlined"
              className={classes.textField}
            />
            <div>
              <label className={classes.label} htmlFor="role">Role</label>
              <div className={classes.select}>
                <SounglahSelect
                  id="role"
                  placeholder="Select role"
                  data={roleOptions}
                  value={form.role_id ? form.role_id.toString() : ''}
                  onChange={val => handleFormChange('role_id', Number(val))}
                  backgroundColor={theme.colors?.beige?.[3] || '#FFF2DF'}
                />
              </div>
            </div>
            {formError && (
              <div className={classes.errorText}>{formError}</div>
            )}
          </div>
        </DialogContent>

        <DialogActions className={classes.actions}>
          <SounglahButton
            variant="secondary"
            type="button"
            onClick={handleClose}
            disabled={formLoading}
          >
            Cancel
          </SounglahButton>
          <SounglahButton
            variant="primary"
            type="submit"
            disabled={!isFormValid || formLoading}
            style={{ minWidth: 120 }}
          >
            {formLoading ? (
              <CircularProgress size={20} style={{ color: 'white' }} />
            ) : (
              'Create User'
            )}
          </SounglahButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}); 