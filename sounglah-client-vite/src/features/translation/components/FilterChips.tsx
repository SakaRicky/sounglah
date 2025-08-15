import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import { AnimatePresence, motion } from 'framer-motion';

export interface FilterChipsProps {
  statusFilter: string;
  languageFilter: string;
  targetLanguageFilter: string;
  reviewerFilter: string;
  startDate: string;
  endDate: string;
  searchTerm?: string;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ 
  statusFilter, 
  languageFilter, 
  targetLanguageFilter,
  reviewerFilter, 
  startDate, 
  endDate, 
  searchTerm = '',
  onRemove, 
  onClearAll 
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chips = [];
  if (statusFilter) chips.push({ label: `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`, key: 'status' });
  if (languageFilter) chips.push({ label: `Source: ${languageFilter}`, key: 'language' });
  if (targetLanguageFilter) chips.push({ label: `Target: ${targetLanguageFilter}`, key: 'targetLanguage' });
  if (reviewerFilter) chips.push({ label: `Reviewer: ${reviewerFilter}`, key: 'reviewer' });
  if (searchTerm) chips.push({ label: `Search: ${searchTerm}`, key: 'search' });
  // Add date range chip if either date is set
  if (startDate || endDate) {
    let dateLabel = 'Date Range: ';
    if (startDate && endDate) {
      dateLabel += `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      dateLabel += `From ${formatDate(startDate)}`;
    } else if (endDate) {
      dateLabel += `Until ${formatDate(endDate)}`;
    }
    chips.push({ label: dateLabel, key: 'dateRange' });
  }

  if (chips.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 8px 0', flexWrap: 'wrap' }}>
      <AnimatePresence initial={false}>
        {chips.map(chip => (
          <motion.span
            key={chip.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, duration: 0.32 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#ffe0ad',
              color: '#4e3b2a',
              borderRadius: 18,
              padding: '0.3em 1.1em 0.3em 1.1em',
              fontWeight: 600,
              fontFamily: 'Georgia, serif',
              fontSize: 15,
              boxShadow: '0 2px 8px rgba(251, 140, 0, 0.08)',
              border: '1.5px solid #fb8c00',
              marginRight: 4,
              marginBottom: 4,
              letterSpacing: 0.2,
            }}
          >
            {chip.label}
            <CancelIcon
              style={{ marginLeft: 8, fontSize: 18, cursor: 'pointer', color: '#d32f2f' }}
              onClick={() => onRemove(chip.key)}
              aria-label={`Remove ${chip.label} filter`}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onRemove(chip.key); }}
              role="button"
            />
          </motion.span>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {chips.length > 1 && (
          <motion.button
            key="clear-all"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, duration: 0.32 }}
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              fontWeight: 600,
              fontFamily: 'Georgia, serif',
              fontSize: 15,
              cursor: 'pointer',
              marginLeft: 8,
              textDecoration: 'underline',
            }}
          >
            Clear All
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}; 