import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import { SounglahTable } from '@/components/atoms/Table';
import { TranslationStats } from '../TranslationStats';
import { TranslationFilters as TranslationFiltersComponent } from '../TranslationFilters';
import { FilterChips } from '../../FilterChips';
import { TableHeader } from '../TableHeader';
import { TableActions } from '../TableActions';
import { MobileActions } from '../MobileActions';
import { BulkConfirmDialog } from '../BulkConfirmDialog';
import { getTranslationTableColumns } from '../translationTableColumns';
import { useTranslationContent } from '../../../hooks/useTranslationContent';
import type { Translation } from '../../../api/types';
import type { Language } from '../../../api/types';
import type { User } from '../../../../users/api/users';
import type { TranslationFilters, FilterHandlers } from '../../../hooks/useTranslationFilters';
import type { ExportState, ExportHandlers } from '../../../hooks/useExport';
import classes from './TranslationContent.module.scss';

interface TranslationContentProps {
  translations: Translation[];
  languages: Language[];
  reviewers: User[];
  filters: TranslationFilters;
  filterHandlers: FilterHandlers;
  exportState: ExportState;
  exportHandlers: ExportHandlers;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onAddClick: () => void;
  onUploadClick: () => void;
  handleEditClick: (translation: Translation) => void;
  handleApprove: (translation: Translation) => void;
  handleDeny: (translation: Translation) => void;
  isLoading: boolean;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const TranslationContent: React.FC<TranslationContentProps> = (props) => {
  const { state, handlers } = useTranslationContent(
    props.translations,
    props.languages,
    props.reviewers,
    props.filters,
    props.filterHandlers,
    props.exportState,
    props.exportHandlers,
    props.page,
    props.rowsPerPage,
    props.totalCount,
    props.isLoading,
    props.onPageChange,
    props.onRowsPerPageChange,
    props.onAddClick,
    props.onUploadClick,
    props.handleEditClick,
    props.handleApprove,
    props.handleDeny,
  );

  // Convert the hook's getStatusBadge to JSX
  const getStatusBadgeJSX = (status: string, isMobile?: boolean) => {
    const badgeData = handlers.getStatusBadge(status, isMobile);
    if (badgeData.type === 'mobile') {
      return <span style={{ color: badgeData.color, fontSize: 22 }} title={badgeData.title}>{badgeData.symbol}</span>;
    } else {
      if (badgeData.style === 'approved') {
        return <span style={{ background: badgeData.color, color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>{badgeData.text}</span>;
      }
      if (badgeData.style === 'pending') {
        return <span style={{ background: badgeData.color, color: '#000', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>{badgeData.text}</span>;
      }
      if (badgeData.style === 'rejected') {
        return <span style={{ background: badgeData.color, color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>{badgeData.text}</span>;
      }
      return <span style={{ background: badgeData.color, color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>{badgeData.text}</span>;
    }
  };

  const translationTableColumns = getTranslationTableColumns({
    selectedIds: state.tableState.selectedIds,
    handleSelectRow: state.tableHandlers.handleSelectRow,
    selectAllChecked: state.selectAllChecked,
    selectAllIndeterminate: state.selectAllIndeterminate,
    handleSelectAll: state.tableHandlers.handleSelectAll,
    getStatusBadge: getStatusBadgeJSX,
    reviewers: state.reviewers,
    handleEditClick: handlers.handleEditClick,
    handleApprove: handlers.handleApprove,
    handleDeny: handlers.handleDeny,
    actionsHeader: <TableHeader onAddClick={handlers.onAddClick} onUploadClick={handlers.onUploadClick} />,
  });

  return (
    <div className={classes.centerContainer + ' translation-management-center-mobile'}>
      <div>
        <TranslationStats translations={state.translations} />
      </div>
      <div className={classes.filtersAndActionsRow}>
        <div className={classes.filtersRow}>
          <div style={{ flex: 1 }}>
            <div className={classes.toolRow}>
              <TranslationFiltersComponent
                languages={state.languages}
                languageFilter={state.filters.languageFilter}
                targetLanguageFilter={state.filters.targetLanguageFilter}
                statusFilter={state.filters.statusFilter}
                startDate={state.filters.startDate}
                endDate={state.filters.endDate}
                onLanguageChange={state.filterHandlers.setLanguageFilter}
                onTargetLanguageChange={state.filterHandlers.setTargetLanguageFilter}
                onStatusChange={state.filterHandlers.setStatusFilter}
                onStartDateChange={state.filterHandlers.setStartDate}
                onEndDateChange={state.filterHandlers.setEndDate}
                statusOptions={STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>
      <FilterChips
        statusFilter={state.filters.statusFilter}
        languageFilter={state.filters.languageFilter}
        targetLanguageFilter={state.filters.targetLanguageFilter}
        reviewerFilter={state.filters.reviewerFilter}
        startDate={state.filters.startDate}
        endDate={state.filters.endDate}
        onRemove={state.filterHandlers.removeFilter}
        onClearAll={state.filterHandlers.clearAllFilters}
      />
      <div className={classes.tableContainer + ' translation-management-table-mobile'} style={{ position: 'relative', overflowX: 'auto' }} ref={state.tableContainerRef}>
        {state.showScrollCue && <div className={classes.scrollCue} />}
        <SounglahTable
          columns={translationTableColumns}
          data={state.translations}
          getRowKey={(row) => row.id}
          pagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          defaultRowsPerPage={25}
          dense={true}
          page={state.page}
          rowsPerPage={state.rowsPerPage}
          totalCount={state.totalCount}
          onPageChange={handlers.onPageChange}
          onRowsPerPageChange={handlers.onRowsPerPageChange}
          ariaLabel="Translation management table"
          emptyMessage="No translations found. Use the filters above to adjust your search or add new translations."
          footerLeftContent={
            <TableActions
              selectedCount={state.tableState.selectedIds.size}
              onBulkApprove={state.bulkActionHandlers.handleBulkApprove}
              onBulkReject={state.bulkActionHandlers.handleBulkReject}
              onExport={state.exportHandlers.handleExport}
              isExporting={state.exportState.exporting}
            />
          }
        />
        
        {/* Mobile Actions */}
        {state.isMobile && (
          <MobileActions
            onAddClick={handlers.onAddClick}
            onUploadClick={handlers.onUploadClick}
          />
        )}

        <AnimatePresence>
          {state.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CircularProgress size={48} color="primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bulk Action Confirmation Dialog */}
      <BulkConfirmDialog
        open={state.bulkActionState.bulkDialogOpen}
        actionType={state.bulkActionState.bulkAction || 'approve'}
        count={state.tableState.selectedIds.size}
        onCancel={state.bulkActionHandlers.handleBulkDialogClose}
        onConfirm={state.bulkActionHandlers.handleBulkConfirm}
        processing={state.bulkActionState.isProcessing}
      />
      
      {/* Hidden descriptions for screen readers */}
      <div id="add-translation-description" className="sr-only">
        Opens a modal to manually add a new translation pair.
      </div>
      <div id="upload-csv-description" className="sr-only">
        Opens a modal to upload a CSV file containing multiple translation pairs.
      </div>
      
      {/* Selection announcement for screen readers */}
      {state.tableState.selectedIds.size > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {state.tableState.selectedIds.size} item{state.tableState.selectedIds.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}; 