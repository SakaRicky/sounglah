import React, { useState, useCallback, useMemo } from 'react';
import { SounglahTable } from '@/components/atoms/Table';
import { getLanguageTableColumns } from '../components/LanguageManagement/languageTableColumns';
import { CreateLanguageModal } from '../components/LanguageManagement/CreateLanguageModal';
import { EditLanguageModal } from '../components/LanguageManagement/EditLanguageModal';
import { LanguageCardList } from '../components/LanguageManagement/LanguageCardList';
import { DeleteConfirmationModal } from '@/components/atoms/DeleteConfirmationModal';
import classes from './LanguageManagement.module.scss';
import { IconButton, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { AnimatePresence, motion } from 'framer-motion';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { LanguagesPageSkeleton } from '@/components/atoms/LanguagesPageSkeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDeleteLanguage } from '../hooks/useLanguages';
import type { Language } from '../api/languages';

interface LanguageManagementProps {
  languages: Language[];
  isLoading?: boolean;
  error?: Error | null;
}

export const LanguageManagement: React.FC<LanguageManagementProps> = ({ 
  languages = [], 
  isLoading = false, 
  error = null 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editLanguage, setEditLanguage] = useState<Language | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // React Query hooks
  const deleteLanguageMutation = useDeleteLanguage();

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
    setLanguageToDelete(language);
    setDeleteModalOpened(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!languageToDelete) return;

    try {
      await deleteLanguageMutation.mutateAsync(languageToDelete.id);

      // Remove from selected IDs if it was selected
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(languageToDelete.id);
        return newSet;
      });

      // Close the modal
      setDeleteModalOpened(false);
      setLanguageToDelete(null);

    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete language:', error);
    }
  }, [languageToDelete, deleteLanguageMutation]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpened(false);
    setLanguageToDelete(null);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setCreateModalOpened(false);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditModalOpened(false);
    setEditLanguage(null);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
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
    [
      selectedIds,
      handleSelectRow,
      selectAllChecked,
      selectAllIndeterminate,
      handleSelectAll,
      handleEditClick,
      handleDeleteClick,
    ]
  );

  // Loading state - show skeleton instead of full-screen loading
  if (isLoading) {
    return <LanguagesPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className={classes.errorContainer}>
        <p>Failed to load languages. Please try again.</p>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.title}>Language Management</h1>
        <p className={classes.subtitle}>
          Manage supported languages for translation
        </p>
      </div>

      {/* Desktop Add Language Button */}
      {!isMobile && (
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
      )}

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

        {/* Floating Action Button - Mobile Only */}
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
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateSuccess}
          />
        )}
        {editModalOpened && editLanguage && (
          <EditLanguageModal
            opened={editModalOpened}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            language={editLanguage}
          />
        )}
        {deleteModalOpened && languageToDelete && (
          <DeleteConfirmationModal
            opened={deleteModalOpened}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Delete Language"
            message="Are you sure you want to delete this language?"
            itemName={languageToDelete.name}
            itemType="language"
            loading={deleteLanguageMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 