import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SounglahTable } from '@/components/atoms/Table';
import { getLanguageTableColumns } from '../components/LanguageManagement/languageTableColumns';
import { CreateLanguageModal } from '../components/LanguageManagement/CreateLanguageModal';
import { EditLanguageModal } from '../components/LanguageManagement/EditLanguageModal';
import { LanguageCardList } from '../components/LanguageManagement/LanguageCardList';
import { getLanguages, deleteLanguage } from '../api/languages';
import type { Language } from '../api/languages';
import classes from './LanguageManagement.module.scss';
import { useNotification } from '@/contexts/NotificationContext';
import { IconButton, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { AnimatePresence, motion } from 'framer-motion';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import useMediaQuery from '@mui/material/useMediaQuery';

export const LanguageManagement: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editLanguage, setEditLanguage] = useState<Language | null>(null);
  const notify = useNotification();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Fetch languages
  const fetchLanguages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLanguages();
      setLanguages(response.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      notify.notify({
        type: 'error',
        title: 'Failed to Load Languages',
        detail: 'An error occurred while loading languages.'
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

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
      setSelectedIds(new Set(languages.map(lang => lang.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [languages]);

  const selectAllChecked = useMemo(() => {
    return languages.length > 0 && selectedIds.size === languages.length;
  }, [languages.length, selectedIds.size]);

  const selectAllIndeterminate = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < languages.length;
  }, [selectedIds.size, languages.length]);

  // Action handlers
  const handleEditClick = useCallback((language: Language) => {
    setEditLanguage(language);
    setEditModalOpened(true);
  }, []);

  const handleDeleteClick = useCallback((language: Language) => {
    if (window.confirm(`Are you sure you want to delete language "${language.name}"?`)) {
      deleteLanguage(language.id)
        .then(() => {
          fetchLanguages();
          notify.notify({
            type: 'success',
            title: 'Language Deleted',
            detail: `Language "${language.name}" has been deleted successfully.`
          });
        })
        .catch((error) => {
          let errorMsg = 'Could not delete language.';
          if (error?.response?.data?.error) {
            errorMsg = error.response.data.error;
          }
          notify.notify({
            type: 'error',
            title: 'Failed to Delete Language',
            detail: errorMsg
          });
        });
    }
  }, [fetchLanguages, notify]);

  const handleCreateSuccess = useCallback(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleCloseModal = useCallback(() => {
    setCreateModalOpened(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpened(false);
    setEditLanguage(null);
  }, []);

  // Table columns
  const languageTableColumns = useMemo(() => 
    getLanguageTableColumns({
      selectedIds,
      handleSelectRow,
      selectAllChecked,
      selectAllIndeterminate,
      handleSelectAll,
      handleEditClick,
      handleDeleteClick,
      actionsHeader: (
        <div className={classes.tableHeaderActions}>
          <Tooltip title="Add Language">
            <span>
              <IconButton
                onClick={() => setCreateModalOpened(true)}
                size="small"
                style={{ color: 'var(--mantine-color-brown-1)' }}
                aria-label="Add new language"
              >
                <LanguageIcon style={{ fontSize: 20 }} />
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
          message="Loading languages..." 
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
        <h1 className={classes.title}>Language Management</h1>
        <p className={classes.subtitle}>
          Manage source and target languages for translations
        </p>
      </motion.div>

      {/* Add Language Button (desktop only, hidden on mobile by SCSS) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <SounglahButton
          variant="primary"
          onClick={() => setCreateModalOpened(true)}
          style={{ minWidth: 140, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
          aria-label="Add new language"
        >
          <LanguageIcon style={{ fontSize: 22 }} />
          Add Language
        </SounglahButton>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={classes.content}
      >
        {/* Render table on desktop, cards on mobile */}
        {!isMobile ? (
          <SounglahTable
            columns={languageTableColumns}
            data={languages}
            getRowKey={(language) => language.id}
            pagination={false}
            ariaLabel="Languages table"
            emptyMessage="No languages found."
          />
        ) : (
          <LanguageCardList
            languages={languages}
            selectedIds={selectedIds}
            onSelectLanguage={handleSelectRow}
            onEditLanguage={handleEditClick}
            onDeleteLanguage={handleDeleteClick}
          />
        )}
        
        {/* Floating Action Buttons - Mobile Only */}
        {isMobile && (
          <div className={classes.floatingActionButtons}>
            <Tooltip title="Add Language" placement="left">
              <IconButton
                onClick={() => setCreateModalOpened(true)}
                size="large"
                aria-label="Add Language"
                className={classes.fab}
                style={{ backgroundColor: '#fb8c00', color: '#fff', width: 56, height: 56, boxShadow: '0 4px 12px rgba(251, 140, 0, 0.3)' }}
              >
                <LanguageIcon style={{ fontSize: 32 }} />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {createModalOpened && (
          <CreateLanguageModal
            opened={createModalOpened}
            onClose={handleCloseModal}
            onSuccess={handleCreateSuccess}
          />
        )}
        {editModalOpened && (
          <EditLanguageModal
            opened={editModalOpened}
            onClose={handleCloseEditModal}
            onSuccess={handleCreateSuccess}
            language={editLanguage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 