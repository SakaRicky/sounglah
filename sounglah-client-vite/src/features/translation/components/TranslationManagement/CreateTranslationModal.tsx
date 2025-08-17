import React, { useEffect, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import TextField from '@mui/material/TextField';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';
import { useCreateTranslation, useUpdateTranslation } from '../../hooks/useTranslations';
import type { Language, Translation } from '../../api/types';
import { AxiosError } from 'axios';
import classes from './CreateTranslationModal.module.scss';
import { theme } from '@/theme';
import { useNotification } from '@/contexts/NotificationContext';
import { useFormState } from '@/hooks/useFormState';
import { AnimatePresence, motion } from 'framer-motion';

interface CreateTranslationModalProps {
  opened: boolean;
  onClose: () => void;
  languages: Language[];
  onSuccess: (updated?: Translation) => void;
  translation?: Translation | null;
  mode?: 'add' | 'edit';
  onApprove?: (t: Translation) => Promise<void> | void;
  onReject?: (t: Translation) => Promise<void> | void;
}

export const CreateTranslationModal = React.memo<CreateTranslationModalProps>(({ 
  opened, 
  onClose, 
  languages, 
  onSuccess, 
  translation = null, 
  mode = 'add',
  onApprove,
  onReject,
}) => {
  // Standardized form state management
  const [formState, formHandlers] = useFormState({
    source_lang_id: translation ? String(translation.source_language.id) : '',
    target_lang_id: translation ? String(translation.target_language.id) : '',
    source_text: translation ? translation.source_text : '',
    target_text: translation ? translation.target_text : '',
  });
  
  const notify = useNotification();
  const [actionLoading, setActionLoading] = React.useState<null | 'approve' | 'reject'>(null);
  const createMutation = useCreateTranslation();
  const updateMutation = useUpdateTranslation();

  useEffect(() => {
    if (translation && mode === 'edit') {
      formHandlers.reset({
        source_lang_id: String(translation.source_language.id),
        target_lang_id: String(translation.target_language.id),
        source_text: translation.source_text,
        target_text: translation.target_text,
      });
    } else if (mode === 'add') {
      formHandlers.reset({
        source_lang_id: '',
        target_lang_id: '',
        source_text: '',
        target_text: '',
      });
    }
  }, [translation, mode, opened]);

  const handleFormChange = useCallback((field: string, value: string) => {
    formHandlers.setField(field as keyof typeof formState.data, value);
  }, [formState]);

  const handleClose = useCallback(() => {
    formHandlers.reset();
    formHandlers.clearAllErrors();
    formHandlers.setLoading(false);
    formHandlers.setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    formHandlers.setSubmitted(true);
    
    // Custom validation for required fields
    const validator = (data: typeof formState.data) => ({
      source_lang_id: !data.source_lang_id ? 'Source language is required' : '',
      target_lang_id: !data.target_lang_id ? 'Target language is required' : '',
      source_text: !data.source_text.trim() ? 'Source text is required' : '',
      target_text: !data.target_text.trim() ? 'Target text is required' : '',
    });
    
    if (!formHandlers.validate(validator)) {
      return;
    }
    
    formHandlers.setLoading(true);
    try {
      if (mode === 'edit' && translation) {
        const updated = await updateMutation.mutateAsync({
          id: translation.id,
          data: {
            source_text: formState.data.source_text,
            target_text: formState.data.target_text,
            source_lang_id: Number(formState.data.source_lang_id),
            target_lang_id: Number(formState.data.target_lang_id),
          }
        });
        handleClose();
        onSuccess(updated);
      } else {
        await createMutation.mutateAsync({
          source_text: formState.data.source_text,
          target_text: formState.data.target_text,
          source_lang_id: Number(formState.data.source_lang_id),
          target_lang_id: Number(formState.data.target_lang_id),
        });
        handleClose();
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage = err.response?.data?.error || 'Failed to save translation.';
        formHandlers.setFieldError('source_text', errorMessage);
        notify.notify({
          type: 'error',
          title: mode === 'edit' ? 'Failed to Update Translation' : 'Failed to Add Translation',
          detail: errorMessage
        });
      } else {
        formHandlers.setFieldError('source_text', 'Failed to save translation.');
        notify.notify({
          type: 'error',
          title: mode === 'edit' ? 'Failed to Update Translation' : 'Failed to Add Translation',
          detail: 'An error occurred while saving the translation.'
        });
      }
    } finally {
      formHandlers.setLoading(false);
    }
  }, [formState, mode, translation, handleClose, onSuccess, updateMutation, createMutation]);

  const handleApproveClick = useCallback(async () => {
    if (!translation || !onApprove) return;
    try {
      setActionLoading('approve');
      await onApprove(translation);
      handleClose();
    } finally {
      setActionLoading(null);
    }
  }, [translation, onApprove, handleClose]);

  const handleRejectClick = useCallback(async () => {
    if (!translation || !onReject) return;
    try {
      setActionLoading('reject');
      await onReject(translation);
      handleClose();
    } finally {
      setActionLoading(null);
    }
  }, [translation, onReject, handleClose]);

  // Memoize language options to prevent unnecessary re-renders
  const languageOptions = useMemo(() => 
    languages.map(l => ({ value: String(l.id), label: l.name })), 
    [languages]
  );

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return formState.data.source_lang_id && 
           formState.data.target_lang_id && 
           formState.data.source_text.trim() && 
           formState.data.target_text.trim();
  }, [formState.data]);

  return (
    <Dialog
      open={opened}
      onClose={handleClose}
      classes={{ paper: classes.translationModal }}
      maxWidth="xs"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: "10px",
        },
      }}
      fullWidth
      disableEnforceFocus={true}
    >
      <AnimatePresence>
        {opened && (
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <DialogTitle className={classes.header}>
              {mode === 'edit' ? 'Edit Translation Pair' : 'Add Translation Pair'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent className={classes.content}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label className={classes.label} htmlFor="source-lang">Source Language *</label>
                    <div className={classes.select}>
                      <SounglahSelect
                        id="source-lang"
                        placeholder="Select source language"
                        data={languageOptions}
                        value={formState.data.source_lang_id}
                        onChange={val => handleFormChange('source_lang_id', val || '')}
                        error={formState.hasSubmitted && !!formState.errors.source_lang_id}
                        backgroundColor={theme.colors?.beige?.[3] || '#FFF2DF'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={classes.label} htmlFor="target-lang">Target Language *</label>
                    <div className={classes.select}>
                      <SounglahSelect
                        id="target-lang"
                        placeholder="Select target language"
                        data={languageOptions}
                        value={formState.data.target_lang_id}
                        onChange={val => handleFormChange('target_lang_id', val || '')}
                        error={formState.hasSubmitted && !!formState.errors.target_lang_id}
                        backgroundColor={theme.colors?.beige?.[3] || '#FFF2DF'}
                      />
                    </div>
                  </div>
                  <TextField
                    label="Source Text *"
                    placeholder="Enter source text"
                    minRows={2}
                    multiline
                    value={formState.data.source_text}
                    onChange={e => handleFormChange('source_text', e.target.value)}
                    error={formState.hasSubmitted && !!formState.errors.source_text}
                    variant="outlined"
                    className={classes.textField}
                  />
                  <TextField
                    label="Target Text *"
                    placeholder="Enter translated text"
                    minRows={2}
                    multiline
                    value={formState.data.target_text}
                    onChange={e => handleFormChange('target_text', e.target.value)}
                    error={formState.hasSubmitted && !!formState.errors.target_text}
                    variant="outlined"
                    className={classes.textField}
                  />
                  {formState.errors.source_text && (
                    <div className={classes.errorText}>{formState.errors.source_text}</div>
                  )}
                </div>
              </DialogContent>
              <DialogActions className={classes.actions}>
                <SounglahButton
                  variant="secondary"
                  onClick={handleClose}
                  disabled={formState.isLoading}
                  type="button"
                >
                  Cancel
                </SounglahButton>
                {mode === 'edit' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Tooltip title="Reject" placement="top">
                      <span>
                        <IconButton
                          onClick={handleRejectClick}
                          disabled={formState.isLoading || actionLoading !== null}
                          size="small"
                          aria-label="Reject translation"
                          sx={{ color: '#d32f2f' }}
                        >
                          {actionLoading === 'reject' ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ThumbDownAltIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Approve" placement="top">
                      <span>
                        <IconButton
                          onClick={handleApproveClick}
                          disabled={formState.isLoading || actionLoading !== null}
                          size="small"
                          aria-label="Approve translation"
                          sx={{ color: '#078930' }}
                        >
                          {actionLoading === 'approve' ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ThumbUpAltIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                )}
                <SounglahButton
                  variant="primary"
                  type="submit"
                  disabled={formState.isLoading || !isFormValid}
                >
                  {formState.isLoading ? (
                    <>
                      <CircularProgress size={16} style={{ marginRight: 8 }} />
                      {mode === 'edit' ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    mode === 'edit' ? 'Update' : 'Create'
                  )}
                </SounglahButton>
              </DialogActions>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
});

CreateTranslationModal.displayName = 'CreateTranslationModal'; 