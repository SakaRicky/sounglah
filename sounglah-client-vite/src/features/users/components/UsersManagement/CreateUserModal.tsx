import React, { useState, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';
import classes from './CreateUserModal.module.scss';
import { theme } from '@/theme';
import { motion } from 'framer-motion';
import { useCreateUser, useRoles } from '../../hooks/useUsers';

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
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // React Query hooks
  const createUserMutation = useCreateUser();
  const { data: roles = [] } = useRoles();

  React.useEffect(() => {
    if (opened && roles.length > 0) {
      // Set default role_id to first role if not set
      setForm(f => ({ ...f, role_id: roles[0]?.id || 0 }));
    }
  }, [opened, roles]);

  const handleFormChange = useCallback((field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClose = useCallback(() => {
    setForm({ username: '', email: '', password: '', role_id: 0 });
    setFieldErrors({ username: false, email: false, password: false });
    setHasSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    // Custom validation for required fields
    const newFieldErrors = {
      username: !form.username.trim(),
      email: !form.email.trim(),
      password: !form.password.trim(),
    };
    setFieldErrors(newFieldErrors);
    
    if (Object.values(newFieldErrors).some(Boolean)) {
      return; // Don't submit if there are validation errors
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return; // Don't submit if email is invalid
    }

    try {
      await createUserMutation.mutateAsync({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role_id: form.role_id,
      });
      
      handleClose();
      onSuccess();
    } catch (err) {
      // Error handling is done in the mutation hook
      console.error('Failed to create user:', err);
    }
  }, [form, createUserMutation, handleClose, onSuccess]);

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
            <SounglahSelect
              id="role"
              placeholder="Select role"
              data={roleOptions}
              value={form.role_id ? form.role_id.toString() : ''}
              onChange={(val) => handleFormChange('role_id', Number(val))}
              backgroundColor={theme?.colors?.beige?.[3] || '#FFF2DF'}
              className={classes.selectField}
            />
          </div>
        </DialogContent>
        
        <DialogActions className={classes.dialogActions}>
          <SounglahButton
            variant="secondary"
            onClick={handleClose}
            disabled={createUserMutation.isPending}
            style={{ minWidth: 100 }}
          >
            Cancel
          </SounglahButton>
          
          <SounglahButton
            variant="primary"
            type="submit"
            disabled={createUserMutation.isPending || !isFormValid}
            style={{ minWidth: 100 }}
          >
            {createUserMutation.isPending ? (
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