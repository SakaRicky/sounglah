import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';
import { createTranslation, updateTranslation } from '../../api/translations';
import type { Language, Translation } from '../../api/types';
import { AxiosError } from 'axios';
import classes from './CreateTranslationModal.module.scss';
import { theme } from '@/theme';
import { useNotification } from '@/contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

interface CreateTranslationModalProps {
  opened: boolean;
  onClose: () => void;
  languages: Language[];
  onSuccess: (updated?: Translation) => void;
  translation?: Translation | null;
  mode?: 'add' | 'edit';
}

export const CreateTranslationModal = React.memo<CreateTranslationModalProps>(({ 
  opened, 
  onClose, 
  languages, 
  onSuccess, 
  translation = null, 
  mode = 'add' 
}) => {
  const [form, setForm] = useState({
    source_lang_id: translation ? String(translation.source_language.id) : '',
    target_lang_id: translation ? String(translation.target_language.id) : '',
    source_text: translation ? translation.source_text : '',
    target_text: translation ? translation.target_text : '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    source_lang_id: false,
    target_lang_id: false,
    source_text: false,
    target_text: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    if (translation && mode === 'edit') {
      setForm({
        source_lang_id: String(translation.source_language.id),
        target_lang_id: String(translation.target_language.id),
        source_text: translation.source_text,
        target_text: translation.target_text,
      });
    } else if (mode === 'add') {
      setForm({ source_lang_id: '', target_lang_id: '', source_text: '', target_text: '' });
    }
  }, [translation, mode, opened]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClose = useCallback(() => {
    setForm({ source_lang_id: '', target_lang_id: '', source_text: '', target_text: '' });
    setFormError('');
    setFormLoading(false);
    setFieldErrors({ source_lang_id: false, target_lang_id: false, source_text: false, target_text: false });
    setHasSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError('');
    // Custom validation for required fields
    const newFieldErrors = {
      source_lang_id: !form.source_lang_id,
      target_lang_id: !form.target_lang_id,
      source_text: !form.source_text.trim(),
      target_text: !form.target_text.trim(),
    };
    setFieldErrors(newFieldErrors);
    if (Object.values(newFieldErrors).some(Boolean)) {
      setFormError('Please fill in all required fields before submitting.');
      return;
    }
    setFormLoading(true);
    try {
      if (mode === 'edit' && translation) {
        const updated = await updateTranslation(translation.id, {
          source_text: form.source_text,
          target_text: form.target_text,
          source_lang_id: Number(form.source_lang_id),
          target_lang_id: Number(form.target_lang_id),
        });
        handleClose();
        notify.notify({
          type: 'success',
          title: 'Translation Updated',
          detail: 'The translation pair was updated successfully.'
        });
        onSuccess(updated);
      } else {
        await createTranslation({
          source_text: form.source_text,
          target_text: form.target_text,
          source_lang_id: Number(form.source_lang_id),
          target_lang_id: Number(form.target_lang_id),
        });
        handleClose();
        notify.notify({
          type: 'success',
          title: 'Translation Added',
          detail: 'The translation pair was created successfully.'
        });
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setFormError(err.response?.data?.error || 'Failed to save translation.');
        notify.notify({
          type: 'error',
          title: mode === 'edit' ? 'Failed to Update Translation' : 'Failed to Add Translation',
          detail: err.response?.data?.error || 'An error occurred while saving the translation.'
        });
      } else {
        setFormError('Failed to save translation.');
        notify.notify({
          type: 'error',
          title: mode === 'edit' ? 'Failed to Update Translation' : 'Failed to Add Translation',
          detail: 'An error occurred while saving the translation.'
        });
      }
    } finally {
      setFormLoading(false);
    }
  }, [form, mode, translation, handleClose, notify, onSuccess]);

  // Memoize language options to prevent unnecessary re-renders
  const languageOptions = useMemo(() => 
    languages.map(l => ({ value: String(l.id), label: l.name })), 
    [languages]
  );

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return form.source_lang_id && 
           form.target_lang_id && 
           form.source_text.trim() && 
           form.target_text.trim();
  }, [form]);

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
                        value={form.source_lang_id}
                        onChange={val => handleFormChange('source_lang_id', val || '')}
                        error={hasSubmitted && fieldErrors.source_lang_id}
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
                        value={form.target_lang_id}
                        onChange={val => handleFormChange('target_lang_id', val || '')}
                        error={hasSubmitted && fieldErrors.target_lang_id}
                        backgroundColor={theme.colors?.beige?.[3] || '#FFF2DF'}
                      />
                    </div>
                  </div>
                  <TextField
                    label="Source Text *"
                    placeholder="Enter source text"
                    minRows={2}
                    multiline
                    value={form.source_text}
                    onChange={e => handleFormChange('source_text', e.target.value)}
                    error={hasSubmitted && fieldErrors.source_text}
                    variant="outlined"
                    className={classes.textField}
                  />
                  <TextField
                    label="Target Text *"
                    placeholder="Enter translated text"
                    minRows={2}
                    multiline
                    value={form.target_text}
                    onChange={e => handleFormChange('target_text', e.target.value)}
                    error={hasSubmitted && fieldErrors.target_text}
                    variant="outlined"
                    className={classes.textField}
                  />
                  {formError && (
                    <div className={classes.errorText}>{formError}</div>
                  )}
                </div>
              </DialogContent>
              <DialogActions className={classes.actions}>
                <SounglahButton
                  variant="secondary"
                  onClick={handleClose}
                  disabled={formLoading}
                  type="button"
                >
                  Cancel
                </SounglahButton>
                <SounglahButton
                  variant="primary"
                  type="submit"
                  disabled={formLoading || !isFormValid}
                >
                  {formLoading ? (
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