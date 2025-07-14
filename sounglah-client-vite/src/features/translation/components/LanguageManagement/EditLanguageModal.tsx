import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { updateLanguage } from '../../api/languages';
import type { Language, UpdateLanguageRequest } from '../../api/languages';
import { useNotification } from '@/contexts/NotificationContext';
import { theme } from '@/theme';

interface EditLanguageModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language | null;
}

export const EditLanguageModal: React.FC<EditLanguageModalProps> = ({
  opened,
  onClose,
  onSuccess,
  language,
}) => {
  const [formData, setFormData] = useState<UpdateLanguageRequest>({
    name: '',
    iso_code: '',
    region: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  // Update form data when language changes
  useEffect(() => {
    if (language) {
      setFormData({
        name: language.name,
        iso_code: language.iso_code || '',
        region: language.region || '',
        description: language.description || '',
      });
    }
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!language || !formData.name.trim()) {
      notify.notify({
        type: 'error',
        title: 'Language Name Required',
        detail: 'Please enter a language name.',
      });
      return;
    }

    setLoading(true);
    try {
      await updateLanguage(language.id, formData);
      onSuccess();
      onClose();
      notify.notify({
        type: 'success',
        title: 'Language Updated',
        detail: 'Language updated successfully.',
      });
    } catch (err: unknown) {
      let errorMsg = 'Could not update language.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        errorMsg = String((err.response as { error?: string }).error) || errorMsg;
      }
      notify.notify({
        type: 'error',
        title: 'Failed to Update Language',
        detail: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!language) return null;

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
          background: theme.colors?.beige?.[1] || '#FFF2DF',
          margin: 0,
          padding: '24px 24px 16px 24px',
        }}
      >
        Edit Language: {language.name}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent style={{ padding: 24 }}>
          <TextField
            label="Language Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
            style={{ marginBottom: 16 }}
            InputProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[8] || '#6d4c1b',
              }
            }}
            InputLabelProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[6] || '#8b6f3d',
              }
            }}
          />
          
          <TextField
            label="ISO Code"
            value={formData.iso_code}
            onChange={(e) => setFormData(prev => ({ ...prev, iso_code: e.target.value }))}
            fullWidth
            style={{ marginBottom: 16 }}
            placeholder="e.g., en, fr, es"
            InputProps={{
              style: {
                fontFamily: 'monospace',
                color: theme.colors?.brown?.[8] || '#6d4c1b',
              }
            }}
            InputLabelProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[6] || '#8b6f3d',
              }
            }}
          />
          
          <TextField
            label="Region"
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
            fullWidth
            style={{ marginBottom: 16 }}
            placeholder="e.g., West Africa, Europe"
            InputProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[8] || '#6d4c1b',
              }
            }}
            InputLabelProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[6] || '#8b6f3d',
              }
            }}
          />
          
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            placeholder="Brief description of the language..."
            InputProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[8] || '#6d4c1b',
              }
            }}
            InputLabelProps={{
              style: {
                fontFamily: 'Georgia, serif',
                color: theme.colors?.brown?.[6] || '#8b6f3d',
              }
            }}
          />
        </DialogContent>
        
        <DialogActions style={{ padding: '16px 24px 24px 24px', gap: 12 }}>
          <SounglahButton
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            style={{ minWidth: 100, fontWeight: 600, fontSize: 15 }}
          >
            Cancel
          </SounglahButton>
          <SounglahButton
            variant="primary"
            type="submit"
            disabled={loading || !formData.name.trim()}
            style={{ minWidth: 100, fontWeight: 600, fontSize: 15 }}
          >
            {loading ? 'Updating...' : 'Update Language'}
          </SounglahButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 