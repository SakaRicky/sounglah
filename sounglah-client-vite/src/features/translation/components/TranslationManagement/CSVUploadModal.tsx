import React, { useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { SounglahButton } from '@/components/atoms/SounglahButton/SounglahButton';
import Papa from 'papaparse';
import { uploadTranslationsCSV } from '../../api/translations';
import type { ParseResult } from 'papaparse';
import type { UploadCSVResult } from '../../api/translations';
import classes from './CSVUploadModal.module.scss';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AnimatePresence, motion } from 'framer-motion';
import { useFormState } from '@/hooks/useFormState';

interface CSVUploadModalProps {
  opened: boolean;
  onClose: () => void;
}

interface PreviewRow {
  source_text: string;
  target_text: string;
  error?: string;
}

export const CSVUploadModal = React.memo<CSVUploadModalProps>(({ opened, onClose }) => {
  // Standardized form state management
  const [formState, formHandlers] = useFormState({
    previewRows: [] as PreviewRow[],
    fileError: null as string | null,
    fileName: null as string | null,
    uploadResult: null as UploadCSVResult | { error: string } | null,
    sourceLang: '',
    targetLang: '',
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    formHandlers.setField('fileError', null);
    formHandlers.setField('uploadResult', null);
    const file = e.target.files?.[0];
    if (!file) return;
    formHandlers.setField('fileName', file.name);
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result: ParseResult<string[]>) => {
        if (!result.data || result.data.length < 2) {
          formHandlers.setField('fileError', 'CSV must have at least 2 rows: language header and at least one translation pair.');
          formHandlers.setField('previewRows', []);
          formHandlers.setField('sourceLang', '');
          formHandlers.setField('targetLang', '');
          return;
        }
        // First row: language names
        const langRow = result.data[0] as string[];
        if (!langRow[0] || !langRow[1]) {
          formHandlers.setField('fileError', 'First row must specify source and target language names.');
          formHandlers.setField('previewRows', []);
          formHandlers.setField('sourceLang', '');
          formHandlers.setField('targetLang', '');
          return;
        }
        formHandlers.setField('sourceLang', langRow[0]);
        formHandlers.setField('targetLang', langRow[1]);
        // Remaining rows: translation pairs
        const rows: PreviewRow[] = (result.data as string[][]).slice(1).map((row) => {
          const r: PreviewRow = {
            source_text: row[0] || '',
            target_text: row[1] || '',
          };
          if (!r.source_text || !r.target_text) {
            r.error = 'Missing source or target text';
          }
          return r;
        });
        formHandlers.setField('previewRows', rows);
      },
      error: (err: Error) => {
        formHandlers.setField('fileError', 'Failed to parse CSV: ' + err.message);
        formHandlers.setField('previewRows', []);
        formHandlers.setField('sourceLang', '');
        formHandlers.setField('targetLang', '');
      },
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!formState.data.sourceLang || !formState.data.targetLang) return;
    const validRows = formState.data.previewRows.filter(r => !r.error);
    formHandlers.setLoading(true);
    formHandlers.setField('uploadResult', null);
    try {
      const result = await uploadTranslationsCSV(
        validRows.map(r => ({
          source_text: r.source_text,
          target_text: r.target_text,
          source_language: formState.data.sourceLang,
          target_language: formState.data.targetLang,
        }))
      );
      formHandlers.setField('uploadResult', result);
      formHandlers.setField('previewRows', []);
      formHandlers.setField('fileName', null);
      formHandlers.setField('sourceLang', '');
      formHandlers.setField('targetLang', '');
    } catch (err) {
      formHandlers.setField('uploadResult', { error: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      formHandlers.setLoading(false);
    }
  }, [formState.data]);

  const handleClose = useCallback(() => {
    formHandlers.reset();
    formHandlers.clearAllErrors();
    formHandlers.setLoading(false);
    onClose();
  }, [onClose]);

  const handleUploadButtonClick = useCallback(() => {
    document.getElementById('csv-upload-input')?.click();
  }, []);

  // Memoize computed values
  const isValidUpload = useMemo(() => {
    return formState.data.previewRows.length > 0 && 
           !formState.data.previewRows.some(r => r.error) && 
           !formState.isLoading && 
           formState.data.sourceLang && 
           formState.data.targetLang;
  }, [formState.data, formState.isLoading]);

  const validRowsCount = useMemo(() => {
    return formState.data.previewRows.filter(r => !r.error).length;
  }, [formState.data.previewRows]);

  return (
    <Dialog open={opened} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{
      style: { background: 'var(--color-beige, #FFF4E5)', borderRadius: 12, border: '2px solid var(--color-brown, #4E3B2A)' }
    }}>
      <AnimatePresence>
        {opened && (
          <motion.div
            key="csv-modal-content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className={classes.modalHeader}>
              <CloudUploadIcon style={{ fontSize: 32, marginRight: 12 }} />
              <span className={classes.modalTitle}>Upload Translations CSV</span>
            </div>
            <DialogContent style={{ background: 'var(--color-beige, #FFF4E5)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <label htmlFor="csv-upload-input" style={{ margin: 0 }}>
                  <input id="csv-upload-input" type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
                  <SounglahButton
                    variant="primary"
                    className={classes.uploadButton}
                    type="button"
                    onClick={handleUploadButtonClick}
                  >
                    Upload CSV File
                  </SounglahButton>
                </label>
                <SounglahButton
                  variant="primary"
                  onClick={handleUpload}
                  className={classes.uploadButton}
                  disabled={!isValidUpload}
                >
                  {formState.isLoading ? 'Uploading...' : 'Upload'}
                </SounglahButton>
              </div>
              {formState.data.fileName && <div className={classes.selectedFile}>Selected: <b>{formState.data.fileName}</b></div>}
              {formState.data.fileError && <div className={classes.errorText}>{formState.data.fileError}</div>}
              {formState.data.sourceLang && formState.data.targetLang && (
                <div className={classes.languageInfo}>
                  <span>Source Language: <b>{formState.data.sourceLang}</b></span>
                  <span style={{ marginLeft: 32 }}>Target Language: <b>{formState.data.targetLang}</b></span>
                </div>
              )}
              {formState.data.previewRows.length > 0 && (
                <>
                  <div className={classes.languageInfo} style={{ marginBottom: 8 }}>
                    {`Total translation pairs: ${validRowsCount}`}
                  </div>
                  <div className={classes.previewTableWrapper}>
                    <table className={classes.previewTable}>
                      <thead>
                        <tr>
                          <th>Source Text</th>
                          <th>Target Text</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formState.data.previewRows.map((row, i) => (
                          <tr key={row.source_text + row.target_text + i} style={{ background: row.error ? 'var(--color-red-bg, #FFF5F5)' : 'inherit' }}>
                            <td>{row.source_text}</td>
                            <td>{row.target_text}</td>
                            <td className={row.error ? classes.statusError : classes.statusOk}>{row.error ? row.error : 'OK'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {formState.data.uploadResult && (
                <div style={{ marginTop: 24 }}>
                  {'error' in formState.data.uploadResult ? (
                    <div className={classes.errorText}>Upload failed: {formState.data.uploadResult.error}</div>
                  ) : (
                    <>
                      <div style={{ color: 'var(--color-green, #6CA489)', marginBottom: 8 }}>
                        {formState.data.uploadResult.added} of {formState.data.uploadResult.total} translations added successfully.
                      </div>
                      <div className={classes.resultTableWrapper}>
                        <table className={classes.resultTable}>
                          <thead>
                            <tr>
                              <th>Row</th>
                              <th>Source Text</th>
                              <th>Target Text</th>
                              <th>Status</th>
                              <th>Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formState.data.uploadResult.results.map((result, i) => (
                              <tr key={i} style={{ background: result.error ? 'var(--color-red-bg, #FFF5F5)' : 'inherit' }}>
                                <td>{result.row}</td>
                                <td>{result.source_text}</td>
                                <td>{result.target_text}</td>
                                <td className={result.error ? classes.statusError : classes.statusOk}>
                                  {result.error ? 'Failed' : 'Success'}
                                </td>
                                <td>{result.error || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions style={{ background: 'var(--color-beige, #FFF4E5)', padding: '1rem 2rem' }}>
              <SounglahButton variant="secondary" onClick={handleClose}>
                Close
              </SounglahButton>
            </DialogActions>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
});

CSVUploadModal.displayName = 'CSVUploadModal'; 