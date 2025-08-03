import React, { useCallback, useMemo } from 'react';
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
import { LanguagesPageSkeleton, ErrorDisplay } from '@/components/atoms';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDeleteLanguage } from '../hooks/useLanguages';
import type { Language } from '../api/languages';
import { useModalState, useSelectionState, useErrorHandler } from '@/hooks';

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
  // Standardized modal state management
  const [createModalState, createModalHandlers] = useModalState();
  const [editModalState, editModalHandlers] = useModalState<Language>();
  const [deleteModalState, deleteModalHandlers] = useModalState<Language>();
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  // React Query hooks
  const deleteLanguageMutation = useDeleteLanguage();

  // Standardized selection state management
  const [selectionState, selectionHandlers] = useSelectionState(languages, [languages]);

  // Standardized error handling
  const { handleAsyncError } = useErrorHandler();

  // Action handlers
  const handleEditClick = useCallback((language: Language) => {
    editModalHandlers.openEdit(language);
  }, [editModalHandlers]);

  const handleDeleteClick = useCallback((language: Language) => {
    deleteModalHandlers.openEdit(language);
  }, [deleteModalHandlers]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModalState.data) return;

    await handleAsyncError(
      async () => {
        await deleteLanguageMutation.mutateAsync(deleteModalState.data!.id);

        // Remove from selected IDs if it was selected
        selectionHandlers.selectItem(deleteModalState.data!.id, false);

        // Close the modal
        deleteModalHandlers.close();
      },
      {
        errorTitle: 'Failed to Delete Language',
        errorDetail: 'Unable to delete the language. Please try again.',
        context: { languageId: deleteModalState.data?.id, action: 'delete_language' },
      }
    );
  }, [deleteModalState.data, deleteLanguageMutation, deleteModalHandlers, selectionHandlers, handleAsyncError]);

  const handleDeleteCancel = useCallback(() => {
    deleteModalHandlers.close();
  }, [deleteModalHandlers]);

  const handleCreateSuccess = useCallback(() => {
    createModalHandlers.close();
  }, [createModalHandlers]);

  const handleEditSuccess = useCallback(() => {
    editModalHandlers.close();
  }, [editModalHandlers]);

  const handleCloseCreateModal = useCallback(() => {
    createModalHandlers.close();
  }, [createModalHandlers]);

  const handleCloseEditModal = useCallback(() => {
    editModalHandlers.close();
  }, [editModalHandlers]);

  // Table columns
  const languageTableColumns = useMemo(() =>
    getLanguageTableColumns({
      selectedIds: selectionState.selectedIds,
      handleSelectRow: selectionHandlers.selectItem,
      selectAllChecked: selectionState.selectAllChecked,
      selectAllIndeterminate: selectionState.selectAllIndeterminate,
      handleSelectAll: selectionHandlers.selectAll,
      handleEditClick,
      handleDeleteClick,
      actionsHeader: (
        <div className={classes.tableHeaderActions}>
          <Tooltip title="Add Language">
            <span>
              <IconButton
                onClick={() => createModalHandlers.openAdd()}
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
      selectionState,
      selectionHandlers,
      handleEditClick,
      handleDeleteClick,
      createModalHandlers,
    ]
  );

  // Loading state - show skeleton instead of full-screen loading
  if (isLoading) {
    return <LanguagesPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Languages"
        message="Unable to load language data. Please check your connection and try again."
      />
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
            onClick={() => createModalHandlers.openAdd()}
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
            selectedIds={selectionState.selectedIds}
            onSelectLanguage={selectionHandlers.selectItem}
            onEditLanguage={handleEditClick}
            onDeleteLanguage={handleDeleteClick}
          />
        )}

        {/* Floating Action Button - Mobile Only */}
        {isMobile && (
          <div className={classes.floatingActionButtons}>
            <Tooltip title="Add Language" placement="left">
              <IconButton
                onClick={() => createModalHandlers.openAdd()}
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
        {createModalState.isOpen && (
          <CreateLanguageModal
            opened={createModalState.isOpen}
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateSuccess}
          />
        )}
        {editModalState.isOpen && editModalState.data && (
          <EditLanguageModal
            opened={editModalState.isOpen}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            language={editModalState.data}
          />
        )}
        {deleteModalState.isOpen && deleteModalState.data && (
          <DeleteConfirmationModal
            opened={deleteModalState.isOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Delete Language"
            message="Are you sure you want to delete this language?"
            itemName={deleteModalState.data.name}
            itemType="language"
            loading={deleteLanguageMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 