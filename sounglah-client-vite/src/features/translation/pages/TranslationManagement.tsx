/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useMemo } from 'react';
import classes from './TranslationManagement.module.scss';
import type { Translation } from '../api/types';
import { CreateTranslationModal } from '../components/TranslationManagement/CreateTranslationModal';
import { CSVUploadModal } from '../components/TranslationManagement/CSVUploadModal';
import { UsersManagement } from '../../users/pages/UsersManagement';
import { LanguageManagement } from './LanguageManagement';
import { useNotification } from '@/contexts/NotificationContext';
import { useUndoHistory } from '../hooks/useUndoHistory';
import { AdminPageSkeleton, ErrorDisplay } from '@/components/atoms';
import { useTranslations, useBulkUpdateTranslations } from '../hooks/useTranslations';
import { useCommonLanguages, useCommonReviewers } from '@/hooks/useCommonData';
import { useModalState, useErrorHandler } from '@/hooks';
import { useTranslationFilters } from '../hooks/useTranslationFilters';
import { useExport } from '../hooks/useExport';
import { TableNavigation } from '../components/TranslationManagement/TableNavigation';
import { TranslationContent } from '../components/TranslationManagement/TranslationContent';
import type { Language } from '../api/types';



export default function TranslationManagement() {
  // Custom hooks for state management
  const {
    filters,
    handlers: filterHandlers,
    buildQueryParams,
  } = useTranslationFilters();

  const [selectedTable, setSelectedTable] = useState<'translations' | 'users' | 'languages'>('translations');
  
  // Standardized modal state management
  const [translationModalState, translationModalHandlers] = useModalState<Translation>();
  const [csvModalState, csvModalHandlers] = useModalState();
  
  const notify = useNotification();
  const { addAction, popActionById } = useUndoHistory(10);
  const bulkUpdateMutation = useBulkUpdateTranslations();

  // Standardized error handling
  const { handleAsyncError } = useErrorHandler();

  // Pagination state management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // React Query hooks with proper pagination
  const queryParams = buildQueryParams(page, rowsPerPage);

  const { 
    data: translationsData, 
    isLoading: translationsLoading, 
    error: translationsError 
  } = useTranslations(queryParams);
  
  const { data: languagesData = [], isLoading: languagesLoading, error: languagesError } = useCommonLanguages();
  const languages = languagesData as Language[];
  const { data: reviewers = [] } = useCommonReviewers();

  // Extract data from React Query
  const translations = useMemo(() => translationsData?.translations || [], [translationsData?.translations]);
  const totalCount = translationsData?.total || 0;

  // Handle pagination changes
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);





  // Export hook
  const {
    exportState,
    exportHandlers,
  } = useExport(translations);

  // Keyboard shortcuts for selection - moved to TranslationContent hook

  const handleAddClick = useCallback(() => {
    translationModalHandlers.openAdd();
  }, [translationModalHandlers]);

  const handleEditClick = useCallback((translation: Translation) => {
    translationModalHandlers.openEdit(translation);
  }, [translationModalHandlers]);

  // Handle edit save
  const handleEditSave = useCallback(async (updatedTranslation?: Translation) => {
    if (!updatedTranslation) return;
    
    await handleAsyncError(
      async () => {
        // This will be handled by the mutation in the modal
        translationModalHandlers.close();
        notify.notify({
          type: 'success',
          title: 'Translation Updated',
          detail: 'Translation has been updated successfully.'
        });
      },
      {
        errorTitle: 'Failed to Update Translation',
        errorDetail: 'Unable to update the translation. Please try again.',
        context: { translationId: updatedTranslation?.id, action: 'update_translation' },
      }
    );
  }, [notify, translationModalHandlers, handleAsyncError]);



  // Handle approve translation
  const handleApprove = useCallback(async (row: Translation) => {
    const previousState = { ...row };
    
    await handleAsyncError(
      async () => {
        // Use the bulk update mutation for single item approval
        await bulkUpdateMutation.mutateAsync({
          translation_ids: [row.id],
          action: 'approve',
        });
        
        addAction({
          type: 'approve',
          translationId: row.id,
          previousState,
          description: `Approve translation #${row.id}`
        });
        
        // Note: Success notification is handled by the mutation's onSuccess callback
        // We only need to handle the undo functionality
      },
      {
        errorTitle: 'Failed to Approve Translation',
        errorDetail: 'Unable to approve the translation. Please try again.',
        context: { translationId: row.id, action: 'approve_translation' },
      }
    );
  }, [bulkUpdateMutation, addAction, handleAsyncError]);

  // Handle reject translation
  const handleDeny = useCallback(async (row: Translation) => {
    const previousState = { ...row };
    
    await handleAsyncError(
      async () => {
        // Use the bulk update mutation for single item rejection
        await bulkUpdateMutation.mutateAsync({
          translation_ids: [row.id],
          action: 'reject',
        });
        
        addAction({
          type: 'reject',
          translationId: row.id,
          previousState,
          description: `Reject translation #${row.id}`
        });
        
        // Note: Success notification is handled by the mutation's onSuccess callback
        // We only need to handle the undo functionality
      },
      {
        errorTitle: 'Failed to Reject Translation',
        errorDetail: 'Unable to reject the translation. Please try again.',
        context: { translationId: row.id, action: 'reject_translation' },
      }
    );
  }, [bulkUpdateMutation, addAction, handleAsyncError]);






  // Loading state - show skeleton instead of full-screen loading
  if (translationsLoading) {
    return <AdminPageSkeleton />;
  }

  // Error state
  if (translationsError) {
    return (
      <ErrorDisplay
        title="Failed to Load Translations"
        message="Unable to load translation data. Please check your connection and try again."
      />
    );
  }

  return (
    <div className={classes.pageBg + ' translation-management-mobile-wrap'}>
      <TableNavigation
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
      />
      
      {/* Only render the selected table */}
      {selectedTable === 'translations' && (
        <div className={classes.header}>
          <h1 id="translation-management-title">Translation Management</h1>
        </div>
      )}
      {selectedTable === 'users' && (
        <UsersManagement />
      )}
      {selectedTable === 'languages' && (
        <LanguageManagement 
          languages={languages}
          isLoading={languagesLoading}
          error={languagesError}
        />
      )}
      
      {/* Modals */}
      <CreateTranslationModal
        opened={translationModalState.isOpen}
        onClose={translationModalHandlers.close}
        languages={languages}
        onSuccess={handleEditSave}
        translation={translationModalState.data}
        mode={translationModalState.mode === 'view' ? 'add' : translationModalState.mode}
      />
      <CSVUploadModal
        opened={csvModalState.isOpen}
        onClose={csvModalHandlers.close}
      />
      
      {/* Translation Content */}
      {selectedTable === 'translations' && (
        <TranslationContent
          translations={translations}
          languages={languages}
          reviewers={reviewers}
          filters={filters}
          filterHandlers={filterHandlers}
          exportState={exportState}
          exportHandlers={exportHandlers}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onAddClick={handleAddClick}
          onUploadClick={() => csvModalHandlers.openAdd()}
          handleEditClick={handleEditClick}
          handleApprove={handleApprove}
          handleDeny={handleDeny}
          isLoading={translationsLoading}
        />
      )}
    </div>
  );
} 