import React, { useCallback, useMemo } from 'react';
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
import { useFormState } from '@/hooks/useFormState';

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
  // Standardized form state management
  const [formState, formHandlers] = useFormState({
    username: '',
    email: '',
    password: '',
    role_id: 0,
  });

  // React Query hooks
  const createUserMutation = useCreateUser();
  const { data: roles = [] } = useRoles();

  React.useEffect(() => {
    if (opened && roles.length > 0) {
      // Set default role_id to first role if not set
      formHandlers.setField('role_id', roles[0]?.id || 0);
    }
  }, [opened, roles]);

  const handleFormChange = useCallback((field: string, value: string | number) => {
    formHandlers.setField(field as keyof typeof formState.data, value);
  }, [formState.data]);

  const handleClose = useCallback(() => {
    formHandlers.reset();
    formHandlers.clearAllErrors();
    formHandlers.setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    formHandlers.setSubmitted(true);
    
    // Custom validation for required fields
    const validator = (data: typeof formState.data) => ({
      username: !data.username.trim() ? 'Username is required' : '',
      email: !data.email.trim() ? 'Email is required' : '',
      password: !data.password.trim() ? 'Password is required' : '',
    });
    
    if (!formHandlers.validate(validator)) {
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.data.email)) {
      formHandlers.setFieldError('email', 'Please enter a valid email address');
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        username: formState.data.username.trim(),
        email: formState.data.email.trim().toLowerCase(),
        password: formState.data.password,
        role_id: formState.data.role_id,
      });
      
      handleClose();
      onSuccess();
    } catch (err) {
      // Error handling is done in the mutation hook
      console.error('Failed to create user:', err);
    }
  }, [formState.data, createUserMutation, handleClose, onSuccess]);

  // Memoize role options from API
  const roleOptions = React.useMemo(() =>
    roles.map(r => ({ value: r.id.toString(), label: r.name.charAt(0).toUpperCase() + r.name.slice(1) })),
    [roles]
  );

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return formState.data.username.trim() && 
           formState.data.email.trim() && 
           formState.data.password.trim() &&
           !!formState.data.role_id;
  }, [formState.data]);

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
              value={formState.data.username}
              onChange={e => handleFormChange('username', e.target.value)}
              error={formState.hasSubmitted && !!formState.errors.username}
              variant="outlined"
              className={classes.textField}
            />
            <TextField
              label="Email *"
              placeholder="Enter email address"
              type="email"
              value={formState.data.email}
              onChange={e => handleFormChange('email', e.target.value)}
              error={formState.hasSubmitted && !!formState.errors.email}
              variant="outlined"
              className={classes.textField}
            />
            <TextField
              label="Password *"
              placeholder="Enter password"
              type="password"
              value={formState.data.password}
              onChange={e => handleFormChange('password', e.target.value)}
              error={formState.hasSubmitted && !!formState.errors.password}
              variant="outlined"
              className={classes.textField}
            />
            <SounglahSelect
              id="role"
              placeholder="Select role"
              data={roleOptions}
              value={formState.data.role_id ? formState.data.role_id.toString() : ''}
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