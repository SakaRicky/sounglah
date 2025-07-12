import React, { useState, useCallback, useMemo } from 'react';
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
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadCSVResult | { error: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sourceLang, setSourceLang] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result: ParseResult<string[]>) => {
        if (!result.data || result.data.length < 2) {
          setFileError('CSV must have at least 2 rows: language header and at least one translation pair.');
          setPreviewRows([]);
          setSourceLang('');
          setTargetLang('');
          return;
        }
        // First row: language names
        const langRow = result.data[0] as string[];
        if (!langRow[0] || !langRow[1]) {
          setFileError('First row must specify source and target language names.');
          setPreviewRows([]);
          setSourceLang('');
          setTargetLang('');
          return;
        }
        setSourceLang(langRow[0]);
        setTargetLang(langRow[1]);
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
        setPreviewRows(rows);
      },
      error: (err: Error) => {
        setFileError('Failed to parse CSV: ' + err.message);
        setPreviewRows([]);
        setSourceLang('');
        setTargetLang('');
      },
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!sourceLang || !targetLang) return;
    const validRows = previewRows.filter(r => !r.error);
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await uploadTranslationsCSV(
        validRows.map(r => ({
          source_text: r.source_text,
          target_text: r.target_text,
          source_language: sourceLang,
          target_language: targetLang,
        }))
      );
      setUploadResult(result);
      setPreviewRows([]);
      setFileName(null);
      setSourceLang('');
      setTargetLang('');
    } catch (err) {
      setUploadResult({ error: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  }, [previewRows, sourceLang, targetLang]);

  const handleClose = useCallback(() => {
    setPreviewRows([]);
    setFileName(null);
    setFileError(null);
    setSourceLang('');
    setTargetLang('');
    setUploadResult(null);
    onClose();
  }, [onClose]);

  const handleUploadButtonClick = useCallback(() => {
    document.getElementById('csv-upload-input')?.click();
  }, []);

  // Memoize computed values
  const isValidUpload = useMemo(() => {
    return previewRows.length > 0 && 
           !previewRows.some(r => r.error) && 
           !uploading && 
           sourceLang && 
           targetLang;
  }, [previewRows, uploading, sourceLang, targetLang]);

  const validRowsCount = useMemo(() => {
    return previewRows.filter(r => !r.error).length;
  }, [previewRows]);

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
                  {uploading ? 'Uploading...' : 'Upload'}
                </SounglahButton>
              </div>
              {fileName && <div className={classes.selectedFile}>Selected: <b>{fileName}</b></div>}
              {fileError && <div className={classes.errorText}>{fileError}</div>}
              {sourceLang && targetLang && (
                <div className={classes.languageInfo}>
                  <span>Source Language: <b>{sourceLang}</b></span>
                  <span style={{ marginLeft: 32 }}>Target Language: <b>{targetLang}</b></span>
                </div>
              )}
              {previewRows.length > 0 && (
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
                        {previewRows.map((row, i) => (
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
              {uploadResult && (
                <div style={{ marginTop: 24 }}>
                  {'error' in uploadResult ? (
                    <div className={classes.errorText}>Upload failed: {uploadResult.error}</div>
                  ) : (
                    <>
                      <div style={{ color: 'var(--color-green, #6CA489)', marginBottom: 8 }}>
                        {uploadResult.added} of {uploadResult.total} translations added successfully.
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
                            {uploadResult.results.map((result, i) => (
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