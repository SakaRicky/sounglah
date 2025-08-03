import React, { useEffect, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import CircularProgress from '@mui/material/CircularProgress';
import type { Language, UpdateLanguageRequest } from '../../api/languages';
import { theme } from '@/theme';
import { motion } from 'framer-motion';
import { useUpdateLanguage } from '../../hooks/useLanguages';
import { useFormState } from '@/hooks/useFormState';

interface EditLanguageModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

export const EditLanguageModal: React.FC<EditLanguageModalProps> = ({
  opened,
  onClose,
  onSuccess,
  language,
}) => {
  // Standardized form state management
  const [formState, formHandlers] = useFormState<UpdateLanguageRequest>({
    name: '',
    iso_code: '',
    region: '',
    description: '',
  });

  // React Query hook
  const updateLanguageMutation = useUpdateLanguage();

  // Update form data when language changes
  useEffect(() => {
    if (language) {
      formHandlers.reset({
        name: language.name,
        iso_code: language.iso_code || '',
        region: language.region || '',
        description: language.description || '',
      });
    }
  }, [language]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    formHandlers.setSubmitted(true);
    
    // Custom validation for required fields
    const validator = (data: typeof formState.data) => ({
      name: !data.name?.trim() ? 'Language name is required' : '',
      iso_code: !data.iso_code?.trim() ? 'ISO code is required' : '',
      region: '', // Optional field
      description: '', // Optional field
    });
    
    if (!formHandlers.validate(validator)) {
      return;
    }

    try {
      await updateLanguageMutation.mutateAsync({ id: language.id, data: formState.data });
      handleClose();
      onSuccess();
    } catch (err) {
      // Error handling is done in the mutation hook
      console.error('Failed to update language:', err);
    }
  }, [formState.data, language.id, updateLanguageMutation, onSuccess]);

  const handleClose = useCallback(() => {
    formHandlers.clearAllErrors();
    formHandlers.setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleFormChange = useCallback((field: keyof UpdateLanguageRequest, value: string) => {
    formHandlers.setField(field, value);
  }, []);

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return formState.data.name?.trim() && formState.data.iso_code?.trim();
  }, [formState.data]);

  return (
    <Dialog
      open={opened}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          background: theme.colors?.beige?.[0] || '#FFF4E5',
          borderRadius: 16,
          border: `2px solid ${theme.colors?.brown?.[2] || '#e0c9a6'}`,
          boxShadow: '0 8px 32px rgba(180, 138, 74, 0.12), 0 1.5px 4px rgba(180, 138, 74, 0.06)',
        }
      }}
    >
      <DialogTitle
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: theme.colors?.brown?.[8] || '#6d4c1b',
          textAlign: 'center',
          borderBottom: `1.5px solid ${theme.colors?.brown?.[2] || '#e0c9a6'}`,
          padding: '24px 24px 16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Edit Language
        </motion.div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent style={{ padding: '24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <TextField
              label="Language Name *"
              placeholder="e.g., English, French, Spanish"
              value={formState.data.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={formState.hasSubmitted && !!formState.errors.name}
              helperText={formState.errors.name || ''}
              variant="outlined"
              fullWidth
              style={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.colors?.beige?.[1] || '#FFF8F0',
                  borderRadius: 8,
                }
              }}
            />

            <TextField
              label="ISO Code *"
              placeholder="e.g., en, fr, es"
              value={formState.data.iso_code}
              onChange={(e) => handleFormChange('iso_code', e.target.value)}
              error={formState.hasSubmitted && !!formState.errors.iso_code}
              helperText={formState.errors.iso_code || ''}
              variant="outlined"
              fullWidth
              style={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.colors?.beige?.[1] || '#FFF8F0',
                  borderRadius: 8,
                }
              }}
            />

            <TextField
              label="Region (Optional)"
              placeholder="e.g., US, CA, GB"
              value={formState.data.region}
              onChange={(e) => handleFormChange('region', e.target.value)}
              variant="outlined"
              fullWidth
              style={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.colors?.beige?.[1] || '#FFF8F0',
                  borderRadius: 8,
                }
              }}
            />

            <TextField
              label="Description (Optional)"
              placeholder="Brief description of the language"
              value={formState.data.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              style={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.colors?.beige?.[1] || '#FFF8F0',
                  borderRadius: 8,
                }
              }}
            />
          </motion.div>
        </DialogContent>

        <DialogActions
          style={{
            padding: '16px 24px 24px',
            borderTop: `1px solid ${theme.colors?.brown?.[2] || '#e0c9a6'}`,
            gap: 12,
          }}
        >
          <SounglahButton
            variant="secondary"
            onClick={handleClose}
            disabled={updateLanguageMutation.isPending}
            style={{ minWidth: 100 }}
          >
            Cancel
          </SounglahButton>

          <SounglahButton
            variant="primary"
            type="submit"
            disabled={updateLanguageMutation.isPending || !isFormValid}
            style={{ minWidth: 100 }}
          >
            {updateLanguageMutation.isPending ? (
              <CircularProgress size={20} style={{ color: 'white' }} />
            ) : (
              'Update Language'
            )}
          </SounglahButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 