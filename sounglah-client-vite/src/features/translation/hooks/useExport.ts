import { useState, useCallback } from 'react';
import type { Translation } from '../api/types';
import { useNotification } from '@/contexts/NotificationContext';

export interface ExportState {
  exporting: boolean;
}

export interface ExportHandlers {
  setExporting: (exporting: boolean) => void;
  handleExport: () => Promise<void>;
}

export const useExport = (translations: Translation[]) => {
  const [exporting, setExporting] = useState(false);
  const notify = useNotification();

  const handleExport = useCallback(async () => {
    if (translations.length === 0) {
      notify.notify({
        type: 'warning',
        title: 'No data to export',
        detail: 'There are no translations to export.',
      });
      return;
    }

    setExporting(true);

    try {
      // Prepare CSV data (use correct language fields from API response)
      type WithReviewer = { reviewer?: { username?: string } };

      const csvData = translations.map((translation) => ({
        'Source Language': translation.source_language?.name || translation.source_language?.iso_code || '',
        'Target Language': translation.target_language?.name || translation.target_language?.iso_code || '',
        'Source Text': translation.source_text,
        'Target Text': translation.target_text,
        'Status': translation.status,
        'Reviewer': (translation as Translation & WithReviewer).reviewer?.username || '',
        'Created At': translation.created_at ? new Date(translation.created_at).toLocaleDateString() : '',
        'Updated At': translation.updated_at ? new Date(translation.updated_at).toLocaleDateString() : '',
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `translations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify.notify({
        type: 'success',
        title: 'Export successful',
        detail: `${translations.length} translations exported successfully.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      notify.notify({
        type: 'error',
        title: 'Export failed',
        detail: 'Failed to export translations. Please try again.',
      });
    } finally {
      setExporting(false);
    }
  }, [translations, notify]);

  const exportState: ExportState = {
    exporting,
  };

  const exportHandlers: ExportHandlers = {
    setExporting,
    handleExport,
  };

  return {
    exportState,
    exportHandlers,
  };
}; 