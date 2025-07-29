/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';
import classes from './TranslationManagement.module.scss';
import { SounglahTable } from '@/components/atoms/Table';
import { TranslationStats } from '../components/TranslationManagement/TranslationStats';
import { getLanguages, getTranslations, updateTranslation, bulkUpdateTranslations } from '../api/translations';
import type { Language, Translation } from '../api/types';
import type { User } from '@/types';
import { Badge } from '@mantine/core';
import { getUsers } from '../api/users';
import { CreateTranslationModal } from '../components/TranslationManagement/CreateTranslationModal';
import { TranslationFilters } from '../components/TranslationManagement/TranslationFilters';
import { CSVUploadModal } from '../components/TranslationManagement/CSVUploadModal';
import { UsersManagement } from '../../users/pages/UsersManagement';
import { LanguageManagement } from './LanguageManagement';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNotification } from '@/contexts/NotificationContext';
import { createNetworkError, createServerError } from '@/utils/errorHandling';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import { useUndoHistory } from '../hooks/useUndoHistory';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { BulkConfirmDialog } from '../components/TranslationManagement/BulkConfirmDialog';
import { getTranslationTableColumns } from '../components/TranslationManagement/translationTableColumns';
import { Tooltip } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { FilterChips } from '../components/FilterChips';
import { AnimatePresence, motion } from 'framer-motion';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { PiUserSoundDuotone } from 'react-icons/pi';
import { TbLanguageKatakana } from "react-icons/tb";
import { FaLanguage } from "react-icons/fa";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';


type TranslationQueryParams = {
  source_lang?: string;
  target_lang?: string;
  status?: string;
  created_at_start?: string;
  created_at_end?: string;
};

const STATUS_OPTIONS = [
  { value: '', label: 'Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

type ErrorResponse = { error?: string };

export default function TranslationManagement() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announceError, setAnnounceError] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [targetLanguageFilter, setTargetLanguageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [debouncedLanguageFilter, setDebouncedLanguageFilter] = useState('');
  const [debouncedTargetLanguageFilter, setDebouncedTargetLanguageFilter] = useState('');
  const [debouncedStatusFilter, setDebouncedStatusFilter] = useState('');
  const [debouncedStartDate, setDebouncedStartDate] = useState('');
  const [debouncedEndDate, setDebouncedEndDate] = useState('');
  const languageFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetLanguageFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const notify = useNotification();
  const { addAction, popActionById } = useUndoHistory(10);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  // Bulk action processing state
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedTable, setSelectedTable] = useState<'translations' | 'users' | 'languages'>('translations');

  // Selection state management (replaced by hook)
  const {
    selectedIds,
    setSelectedIds,
    selectAllChecked,
    selectAllIndeterminate,
    handleSelectAll,
    handleSelectRow,
  } = useBulkSelection(
    translations,
    [languageFilter, statusFilter, startDate, endDate]
  );

  // Clear selections when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    handleSelectAll(false);
  }, [languageFilter, statusFilter, startDate, endDate, setSelectedIds, handleSelectAll]);

  // Keyboard shortcuts for selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A to select all on current page
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        handleSelectAll(true);
      }
      // Escape to clear selection
      if (event.key === 'Escape') {
        setSelectedIds(new Set());
        handleSelectAll(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, setSelectedIds]);

  // Debounced filter setters for performance optimization
  const setLanguageFilterWithLog = useCallback((val: string) => {
    setLanguageFilter(val);
    setDebouncedLanguageFilter(val);
  }, []);

  const setTargetLanguageFilterWithLog = useCallback((val: string) => {
    setTargetLanguageFilter(val);
    setDebouncedTargetLanguageFilter(val);
  }, []);

  const setStatusFilterWithLog = useCallback((val: string) => {
    setStatusFilter(val);
    setDebouncedStatusFilter(val);
  }, []);

  const setStartDateWithLog = useCallback((val: string) => {
    setStartDate(val);
    setDebouncedStartDate(val);
  }, []);

  const setEndDateWithLog = useCallback((val: string) => {
    setEndDate(val);
    setDebouncedEndDate(val);
  }, []);

  const fetchLanguages = useCallback(async () => {
    try {
      const data = await getLanguages();
      setLanguages(data.languages);
    } catch (err) {
      const appError = createNetworkError(err, { operation: 'fetchLanguages' });
      setLanguages([]);

      notify.notify({
        type: 'error',
        title: 'Failed to Load Languages',
        detail: appError.userMessage,
        error: appError,
        onRetry: () => fetchLanguages(),
        persistent: false
      });
    }
  }, [notify]);

  useEffect(() => {
    fetchLanguages();

    // Cleanup timeouts on unmount
    return () => {
      if (languageFilterTimeoutRef.current) {
        clearTimeout(languageFilterTimeoutRef.current);
      }
      if (targetLanguageFilterTimeoutRef.current) {
        clearTimeout(targetLanguageFilterTimeoutRef.current);
      }
      if (statusFilterTimeoutRef.current) {
        clearTimeout(statusFilterTimeoutRef.current);
      }
      if (startDateTimeoutRef.current) {
        clearTimeout(startDateTimeoutRef.current);
      }
      if (endDateTimeoutRef.current) {
        clearTimeout(endDateTimeoutRef.current);
      }
    };
  }, [fetchLanguages, languageFilter, targetLanguageFilter, statusFilter, startDate, endDate, notify]);

  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      setError('');
      try {
        const params: TranslationQueryParams & { page?: number; limit?: number } = {};
        if (debouncedLanguageFilter) params.source_lang = debouncedLanguageFilter;
        if (debouncedTargetLanguageFilter) params.target_lang = debouncedTargetLanguageFilter;
        if (debouncedStatusFilter) params.status = debouncedStatusFilter;
        if (debouncedStartDate) params.created_at_start = debouncedStartDate;
        if (debouncedEndDate) params.created_at_end = debouncedEndDate;
        params.page = page + 1; // 1-based page for backend
        params.limit = rowsPerPage;
        const data = await getTranslations(params);
        setTranslations(data.translations);
        setTotalCount(data.total || data.translations.length);
      } catch (err) {
        const appError = createServerError(err, {
          operation: 'fetchTranslations',
          filters: { languageFilter, statusFilter, startDate, endDate },
          page,
          rowsPerPage
        });
        setError(appError.userMessage);
        setAnnounceError(true);

        notify.notify({
          type: 'error',
          title: 'Failed to Load Translations',
          detail: appError.userMessage,
          error: appError,
          onRetry: () => {
            // Retry the fetch operation
            fetchTranslations();
          },
          persistent: true
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTranslations();
  }, [debouncedLanguageFilter, debouncedTargetLanguageFilter, debouncedStatusFilter, debouncedStartDate, debouncedEndDate, page, rowsPerPage, languageFilter, targetLanguageFilter, statusFilter, startDate, endDate, notify]);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const data = await getUsers('reviewer');
        setReviewers(data.users);
      } catch (err) {
        const appError = createNetworkError(err, { operation: 'fetchReviewers' });
        setReviewers([]);

        notify.notify({
          type: 'error',
          title: 'Failed to Load Reviewers',
          detail: appError.userMessage,
          error: appError,
          onRetry: () => fetchReviewers(),
          persistent: false
        });
      }
    };
    fetchReviewers();
  }, [notify]);

  const getStatusBadge = useCallback((status: string, isMobile?: boolean) => {
    if (isMobile) {
      if (status === 'approved') return <CheckCircleIcon style={{ color: '#388e3c', fontSize: 22 }} titleAccess="Approved" />;
      if (status === 'pending') return <HourglassEmptyIcon style={{ color: '#fbc02d', fontSize: 22 }} titleAccess="Pending" />;
      if (status === 'rejected') return <CancelIcon style={{ color: '#d32f2f', fontSize: 22 }} titleAccess="Rejected" />;
      return <HourglassEmptyIcon style={{ color: '#bdbdbd', fontSize: 22 }} titleAccess={status} />;
    }
    if (status === 'approved') return (
      <Badge style={{ background: '#388e3c', color: '#fff', fontWeight: 600, letterSpacing: 0.5, borderRadius: 8, padding: '0.3em 1.1em' }}>Approved</Badge>
    );
    if (status === 'pending') return <Badge color="yellow">Pending</Badge>;
    if (status === 'rejected') return <Badge color="red">Rejected</Badge>;
    return <Badge color="gray" variant="light">{status}</Badge>;
  }, []);

  const handleAddClick = useCallback(() => {
    setEditingTranslation(null);
    setModalMode('add');
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback((translation: Translation) => {
    setEditingTranslation(translation);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const handleEditSave = useCallback(async (updatedTranslation?: Translation) => {
    if (!updatedTranslation) return;

    // Find the original translation to save for undo (no longer needed for undo)
    // const originalTranslation = translations.find(t => t.id === updatedTranslation.id);

    try {
      await updateTranslation(updatedTranslation.id, {
        source_text: updatedTranslation.source_text,
        target_text: updatedTranslation.target_text,
        source_lang_id: updatedTranslation.source_language.id,
        target_lang_id: updatedTranslation.target_language.id,
        status: 'pending', // Always reset to pending on edit
      });

      // Refresh translations
      const params: TranslationQueryParams & { page?: number; limit?: number } = {};
      if (languageFilter) params.source_lang = languageFilter;
      if (targetLanguageFilter) params.target_lang = targetLanguageFilter;
      if (statusFilter) params.status = statusFilter;
      params.page = page + 1;
      params.limit = rowsPerPage;
      const data = await getTranslations(params);
      setTranslations(data.translations);
      setTotalCount(data.total || data.translations.length);
      setModalOpen(false);

      notify.notify({
        type: 'success',
        title: 'Translation Edited',
        detail: 'The translation was edited and its status has been reset to pending for review.'
        // No undo for edit
      });
    } catch (err) {
      const appError = createServerError(err, {
        operation: 'updateTranslation',
        translationId: updatedTranslation.id
      });

      notify.notify({
        type: 'error',
        title: 'Failed to Update Translation',
        detail: appError.userMessage,
        error: appError,
        onRetry: () => handleEditSave(updatedTranslation),
        persistent: true
      });
    }
  }, [languageFilter, targetLanguageFilter, statusFilter, page, rowsPerPage, notify]);

  const handleUndoAction = useCallback(async (actionId: string) => {
    const lastAction = popActionById(actionId);
    if (!lastAction) return;

    try {
      await updateTranslation(lastAction.translationId, {
        source_text: lastAction.previousState.source_text,
        target_text: lastAction.previousState.target_text,
        source_lang_id: lastAction.previousState.source_language.id,
        target_lang_id: lastAction.previousState.target_language.id,
        status: lastAction.previousState.status,
      });

      // Refresh translations
      const params: TranslationQueryParams & { page?: number; limit?: number } = {};
      if (languageFilter) params.source_lang = languageFilter;
      if (targetLanguageFilter) params.target_lang = targetLanguageFilter;
      if (statusFilter) params.status = statusFilter;
      params.page = page + 1;
      params.limit = rowsPerPage;
      const data = await getTranslations(params);
      setTranslations(data.translations);
      setTotalCount(data.total || data.translations.length);

      notify.notify({
        type: 'success',
        title: 'Action Undone',
        detail: `Successfully reverted: ${lastAction.description}`
      });
    } catch (err) {
      const appError = createServerError(err, {
        operation: 'undoAction',
        actionId: lastAction?.id
      });

      notify.notify({
        type: 'error',
        title: 'Failed to Undo Action',
        detail: appError.userMessage,
        error: appError,
        persistent: true
      });
    }
  }, [popActionById, languageFilter, targetLanguageFilter, statusFilter, page, rowsPerPage, notify]);

  const handleApprove = useCallback(async (row: Translation) => {
    const previousState = { ...row };
    try {
      await updateTranslation(row.id, {
        source_text: row.source_text,
        target_text: row.target_text,
        source_lang_id: row.source_language.id,
        target_lang_id: row.target_language.id,
        status: 'approved',
      });
      const undoId = addAction({
        type: 'approve',
        translationId: row.id,
        previousState,
        description: `Approve translation #${row.id}`
      });
      notify.notify({
        type: 'success',
        title: 'Translation Approved',
        detail: `Translation #${row.id} has been approved successfully.`,
        onUndo: () => handleUndoAction(undoId)
      });
      // Refresh translations
      const params: TranslationQueryParams & { page?: number; limit?: number } = {};
      if (languageFilter) params.source_lang = languageFilter;
      if (targetLanguageFilter) params.target_lang = targetLanguageFilter;
      if (statusFilter) params.status = statusFilter;
      params.page = page + 1;
      params.limit = rowsPerPage;
      const data = await getTranslations(params);
      setTranslations(data.translations);
      setTotalCount(data.total || data.translations.length);
    } catch (err) {
      const appError = createServerError(err, {
        operation: 'approveTranslation',
        translationId: row.id
      });
      notify.notify({
        type: 'error',
        title: 'Failed to Approve Translation',
        detail: appError.userMessage,
        error: appError,
        onRetry: () => handleApprove(row),
        persistent: true
      });
    }
  }, [languageFilter, targetLanguageFilter, statusFilter, page, rowsPerPage, notify, addAction, handleUndoAction]);

  const handleDeny = useCallback(async (row: Translation) => {
    const previousState = { ...row };
    try {
      await updateTranslation(row.id, {
        source_text: row.source_text,
        target_text: row.target_text,
        source_lang_id: row.source_language.id,
        target_lang_id: row.target_language.id,
        status: 'rejected',
      });
      const undoId = addAction({
        type: 'reject',
        translationId: row.id,
        previousState,
        description: `Reject translation #${row.id}`
      });
      notify.notify({
        type: 'success',
        title: 'Translation Rejected',
        detail: `Translation #${row.id} has been rejected successfully.`,
        onUndo: () => handleUndoAction(undoId)
      });
      // Refresh translations
      const params: TranslationQueryParams & { page?: number; limit?: number } = {};
      if (languageFilter) params.source_lang = languageFilter;
      if (targetLanguageFilter) params.target_lang = targetLanguageFilter;
      if (statusFilter) params.status = statusFilter;
      params.page = page + 1;
      params.limit = rowsPerPage;
      const data = await getTranslations(params);
      setTranslations(data.translations);
      setTotalCount(data.total || data.translations.length);
    } catch (err) {
      const appError = createServerError(err, {
        operation: 'rejectTranslation',
        translationId: row.id
      });
      notify.notify({
        type: 'error',
        title: 'Failed to Reject Translation',
        detail: appError.userMessage,
        error: appError,
        onRetry: () => handleDeny(row),
        persistent: true
      });
    }
  }, [languageFilter, targetLanguageFilter, statusFilter, page, rowsPerPage, notify, addAction, handleUndoAction]);

  // Bulk action handlers
  const handleBulkApprove = useCallback(() => {
    setBulkAction('approve');
    setBulkDialogOpen(true);
  }, []);
  const handleBulkReject = useCallback(() => {
    setBulkAction('reject');
    setBulkDialogOpen(true);
  }, []);
  const handleBulkDialogClose = useCallback(() => {
    setBulkDialogOpen(false);
    setBulkAction(null);
  }, []);

  // Bulk approve/reject logic
  const handleBulkConfirm = useCallback(async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const status = bulkAction === 'approve' ? 'approved' : 'rejected';
      const ids = Array.from(selectedIds);
      let result;
      try {
        result = await bulkUpdateTranslations(ids, status);
      } catch (err: unknown) {
        let errorMsg = 'Unknown error';
        if (err && typeof err === 'object') {
          if ('response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object') {
            const data = err.response.data as ErrorResponse;
            if (data.error) {
              errorMsg = data.error;
            }
          } else if ('message' in err && typeof err.message === 'string') {
            errorMsg = err.message;
          }
        }
        notify.notify({
          type: 'error',
          title: 'Bulk Update Failed',
          detail: errorMsg,
          persistent: true,
        });
        return;
      }
      // Refresh translations
      const params: TranslationQueryParams & { page?: number; limit?: number } = {};
      if (languageFilter) params.source_lang = languageFilter;
      if (targetLanguageFilter) params.target_lang = targetLanguageFilter;
      if (statusFilter) params.status = statusFilter;
      params.page = page + 1;
      params.limit = rowsPerPage;
      const data = await getTranslations(params);
      setTranslations(data.translations);
      setTotalCount(data.total || data.translations.length);
      setSelectedIds(new Set());
      notify.notify({
        type: result.failed.length === 0 ? 'success' : 'error',
        title: `Bulk ${bulkAction === 'approve' ? 'Approve' : 'Reject'} Complete`,
        detail: `${result.success.length} succeeded, ${result.failed.length} failed.`,
        persistent: result.failed.length > 0,
      });
    } finally {
      setBulkProcessing(false);
      setBulkDialogOpen(false);
      setBulkAction(null);
    }
  }, [bulkAction, selectedIds, languageFilter, targetLanguageFilter, statusFilter, page, rowsPerPage, notify, setSelectedIds]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Build query params for current filters
      const params = new URLSearchParams();
      if (languageFilter) params.append('source_lang', languageFilter);
      if (targetLanguageFilter) params.append('target_lang', targetLanguageFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('created_at_start', startDate);
      if (endDate) params.append('created_at_end', endDate);
      // Download CSV
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/translations/export?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to export translations');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg = (err instanceof Error) ? err.message : 'Could not export translations.';
      notify.notify({ type: 'error', title: 'Export Failed', detail: errorMsg });
    } finally {
      setExporting(false);
    }
  };

  // Reviewer filter state (add if not present)
  const [reviewerFilter, setReviewerFilter] = useState('');

  // Remove a filter chip
  const handleRemoveFilter = (key: string) => {
    if (key === 'status') {
      setStatusFilter('');
      setDebouncedStatusFilter('');
    }
    if (key === 'language') {
      setLanguageFilter('');
      setDebouncedLanguageFilter('');
    }
    if (key === 'targetLanguage') {
      setTargetLanguageFilter('');
      setDebouncedTargetLanguageFilter('');
    }
    if (key === 'reviewer') setReviewerFilter('');
    if (key === 'dateRange') {
      setStartDate('');
      setEndDate('');
      setDebouncedStartDate('');
      setDebouncedEndDate('');
    }
  };
  const handleClearAllFilters = () => {
    setStatusFilter('');
    setLanguageFilter('');
    setTargetLanguageFilter('');
    setStartDate('');
    setEndDate('');
    setDebouncedStatusFilter('');
    setDebouncedLanguageFilter('');
    setDebouncedTargetLanguageFilter('');
    setDebouncedStartDate('');
    setDebouncedEndDate('');
    setReviewerFilter('');
  };

  // Table columns definition
  const translationTableColumns = getTranslationTableColumns({
    selectedIds,
    handleSelectRow,
    selectAllChecked,
    selectAllIndeterminate,
    handleSelectAll,
    getStatusBadge,
    reviewers,
    handleEditClick,
    handleApprove,
    handleDeny,
    actionsHeader: (
      <div className={classes.tableHeaderActions}>
        <Tooltip title="Add Translation">
          <span>
            <IconButton
              onClick={handleAddClick}
              size="large"
              aria-label="Add Translation"
              style={{
                color: '#fff',
                width: 44,
                height: 44,
                transition: 'color 0.18s, transform 0.18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <AddCircleOutlineIcon style={{ fontSize: 30 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Upload CSV">
          <span>
            <IconButton
              onClick={() => setCsvModalOpen(true)}
              size="large"
              aria-label="Upload CSV"
              style={{
                color: '#fff',
                width: 44,
                height: 44,
                transition: 'color 0.18s, transform 0.18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <CloudUploadIcon style={{ fontSize: 30 }} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    ),
  });

  const isMobile = useMediaQuery('(max-width: 768px)');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShowScrollCue(false);
      return;
    }
    const checkScroll = () => {
      const el = tableContainerRef.current;
      if (el) {
        setShowScrollCue(el.scrollWidth > el.clientWidth + 8);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [isMobile, translations]);

  return (
    <div className={classes.pageBg + ' translation-management-mobile-wrap'}>
      <div className={classes.segmentedControl}>
        <ToggleButtonGroup
          value={selectedTable}
          exclusive
          onChange={(_e, val) => val && setSelectedTable(val)}
          aria-label="Table selector"
          size="small"
        >
          <ToggleButton value="translations" aria-label="Translations" className={classes.segmentedButton}>
            <TbLanguageKatakana style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }} />
            Translations
          </ToggleButton>
          <ToggleButton value="users" aria-label="Users" className={classes.segmentedButton}>
            <PiUserSoundDuotone style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }} />
            Users
          </ToggleButton>
          <ToggleButton value="languages" aria-label="Languages" className={classes.segmentedButton}>
            <FaLanguage style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }} />
            Languages
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
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
        <LanguageManagement />
      )}
      <CreateTranslationModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        languages={languages}
        onSuccess={handleEditSave}
        translation={editingTranslation}
        mode={modalMode}
      />
      <CSVUploadModal
        opened={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
      />
      {selectedTable === 'translations' && (
        <div className={classes.centerContainer + ' translation-management-center-mobile'}>
          <div>
            <TranslationStats translations={translations} />
          </div>
          <div className={classes.filtersAndActionsRow}>
            <div className={classes.filtersRow}>
              <div style={{ flex: 1 }}>
                <div className={classes.toolRow}>
                  <TranslationFilters
                    languages={languages}
                    languageFilter={languageFilter}
                    targetLanguageFilter={targetLanguageFilter}
                    statusFilter={statusFilter}
                    startDate={startDate}
                    endDate={endDate}
                    onLanguageChange={setLanguageFilterWithLog}
                    onTargetLanguageChange={setTargetLanguageFilterWithLog}
                    onStatusChange={setStatusFilterWithLog}
                    onStartDateChange={setStartDateWithLog}
                    onEndDateChange={setEndDateWithLog}
                    statusOptions={STATUS_OPTIONS}
                  />
                </div>
              </div>
            </div>
          </div>
          <FilterChips
              statusFilter={statusFilter}
              languageFilter={languageFilter}
              targetLanguageFilter={targetLanguageFilter}
              reviewerFilter={reviewerFilter}
              startDate={startDate}
              endDate={endDate}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          <div className={classes.tableContainer + ' translation-management-table-mobile'} style={{ position: 'relative', overflowX: 'auto' }} ref={tableContainerRef}>
            {showScrollCue && <div className={classes.scrollCue} />}
            <SounglahTable
              columns={translationTableColumns}
              data={translations}
              getRowKey={(row) => row.id}
              tableClassName={classes.table}
              containerClassName={classes.tableContainer}
              pagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              defaultRowsPerPage={25}
              dense={true}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
              ariaLabel="Translation management table"
              emptyMessage="No translations found. Use the filters above to adjust your search or add new translations."
              footerLeftContent={selectedIds.size > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0 0 8px' }}>
                  <Tooltip title="Bulk Approve Selected">
                    <span>
                      <SounglahButton
                        variant="primary"
                        onClick={handleBulkApprove}
                        style={{ minWidth: 0, padding: '2px 8px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
                        aria-label="Bulk approve selected translations"
                      >
                        <ThumbUpAltIcon style={{ fontSize: 18, marginRight: 4 }} /> Bulk Approve
                      </SounglahButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Bulk Reject Selected">
                    <span>
                      <SounglahButton
                        variant="secondary"
                        onClick={handleBulkReject}
                        style={{ minWidth: 0, padding: '2px 8px', fontSize: 13, color: '#d32f2f', borderColor: '#d32f2f', display: 'flex', alignItems: 'center', gap: 4 }}
                        aria-label="Bulk reject selected translations"
                      >
                        <ThumbDownAltIcon style={{ fontSize: 18, marginRight: 4 }} /> Bulk Reject
                      </SounglahButton>
                    </span>
                  </Tooltip>
                </div>
              ) : (
                <div style={{ padding: '10px 0 10px 12px', display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Export translations as CSV">
                    <span>
                      <SounglahButton
                        variant="primary"
                        onClick={handleExport}
                        style={{
                          minWidth: 0,
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Export translations as CSV"
                        disabled={exporting}
                      >
                        <CloudDownloadIcon style={{ fontSize: 28, margin: 0 }} />
                      </SounglahButton>
                    </span>
                  </Tooltip>
                </div>
              )}
            />
            {/* Floating Action Buttons - Mobile Only */}
            <div className={classes.floatingActionButtons}>
              <Tooltip title="Add Translation" placement="left">
                <IconButton
                  onClick={handleAddClick}
                  size="large"
                  aria-label="Add Translation"
                  className={classes.fab}
                  style={{
                    backgroundColor: '#fb8c00',
                    color: '#fff',
                    width: 56,
                    height: 56,
                    boxShadow: '0 4px 12px rgba(251, 140, 0, 0.3)',
                  }}
                >
                  <AddCircleOutlineIcon style={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Upload CSV" placement="left">
                <IconButton
                  onClick={() => setCsvModalOpen(true)}
                  size="large"
                  aria-label="Upload CSV"
                  className={classes.fab}
                  style={{
                    backgroundColor: '#078930',
                    color: '#fff',
                    width: 56,
                    height: 56,
                    boxShadow: '0 4px 12px rgba(7, 137, 48, 0.3)',
                  }}
                >
                  <CloudUploadIcon style={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
            </div>

            <AnimatePresence>
              {loading && (
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
          {/* Bulk Action Confirmation Dialog (unchanged) */}
          <BulkConfirmDialog
            open={bulkDialogOpen}
            actionType={bulkAction || 'approve'}
            count={selectedIds.size}
            onCancel={handleBulkDialogClose}
            onConfirm={handleBulkConfirm}
            processing={bulkProcessing}
          />
          {/* Hidden descriptions for screen readers */}
          <div id="add-translation-description" className="sr-only">
            Opens a modal to manually add a new translation pair.
          </div>
          <div id="upload-csv-description" className="sr-only">
            Opens a modal to upload a CSV file containing multiple translation pairs.
          </div>
          {/* Error announcement for screen readers */}
          {announceError && error && (
            <div
              aria-live="assertive"
              aria-atomic="true"
              className="sr-only"
              onAnimationEnd={() => setAnnounceError(false)}
            >
              Error: {error}
            </div>
          )}

          {/* Selection announcement for screen readers */}
          {selectedIds.size > 0 && (
            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
} 