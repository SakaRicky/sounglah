import React from 'react';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';
import { theme } from '@/theme';
import type { Language } from '../../api/types';
import classes from './TranslationFilters.module.scss';
import { DateRangePicker } from './DateRangePicker';
import TextField from '@mui/material/TextField';

const beige2 = theme.colors?.beige?.[2] || '#FFEFD6';

interface TranslationFiltersProps {
  languages: Language[];
  languageFilter: string;
  targetLanguageFilter: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
  searchTerm?: string;
  onLanguageChange: (value: string) => void;
  onTargetLanguageChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearchChange?: (value: string) => void;
  statusOptions: { value: string; label: string }[];
}

export const TranslationFilters = React.memo<TranslationFiltersProps>(({
  languages,
  languageFilter,
  targetLanguageFilter,
  statusFilter,
  startDate,
  endDate,
  searchTerm = '',
  onLanguageChange,
  onTargetLanguageChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  statusOptions,
}) => {
  return (
    <div
      className={classes.filtersRow}
      role="group"
      aria-label="Translation filters"
    >
      <div className={classes.searchGroup}>
        <TextField
          placeholder="Search text..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          inputProps={{ 'aria-label': 'Search translations by text' }}
        />
      </div>
      <div className={classes.filterItems}>
        <div className={classes.statusGroup}>
          <span className={classes.statusLabel}>Status</span>
          <SounglahSelect
            className={classes.filterSelect}
            data={statusOptions}
            placeholder="Select status"
            value={statusFilter}
            onChange={value => onStatusChange(value || '')}
            backgroundColor={beige2}
            ariaLabel="Filter by translation status"
            ariaDescribedBy="status-filter-description"
          />
        </div>
        <div className={classes.languageGroup}>
          <span className={classes.languageLabel}>Languages</span>
          <div className={classes.selects}>
            <SounglahSelect
              className={classes.filterSelect}
              data={[
                { value: '', label: 'Source Language' },
                ...languages.map(l => ({ value: l.name, label: l.name })),
              ]}
              placeholder="Select source language"
              value={languageFilter}
              onChange={value => onLanguageChange(value || '')}
              backgroundColor={beige2}
              ariaLabel="Filter by source language"
              ariaDescribedBy="language-filter-description"
            />
            <SounglahSelect
              className={classes.filterSelect}
              data={[
                { value: '', label: 'Target Language' },
                ...languages.map(l => ({ value: l.name, label: l.name })),
              ]}
              placeholder="Select target language"
              value={targetLanguageFilter}
              onChange={value => onTargetLanguageChange(value || '')}
              backgroundColor={beige2}
              ariaLabel="Filter by target language"
              ariaDescribedBy="target-language-filter-description"
            />
          </div>
        </div>
        <div className={classes.dateGroup}>
          <span className={classes.dateLabel}>Date Range</span>
          <div className={classes.dateRangeGroup}>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
            />
          </div>
        </div>
      </div>
      {/* Hidden descriptions for screen readers */}
      <div id="language-filter-description" className="sr-only">
        Select a source language to filter translations. Leave empty to show all languages.
      </div>
      <div id="target-language-filter-description" className="sr-only">
        Select a target language to filter translations. Leave empty to show all languages.
      </div>
      <div id="status-filter-description" className="sr-only">
        Select a status to filter translations. Options include pending, approved, and rejected.
      </div>
      <div id="search-filter-description" className="sr-only">
        Type to search within source or target text. Debounced to reduce network traffic.
      </div>
    </div>
  );
});

TranslationFilters.displayName = 'TranslationFilters'; 