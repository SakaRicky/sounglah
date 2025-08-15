import React from 'react';
import type { FilterHandlers, TranslationFilters as FilterState } from '../../../hooks/useTranslationFilters';
import { TranslationFilters as TranslationFiltersComponent } from '../TranslationFilters';
import { FilterChips } from '../../FilterChips';
import classes from './TranslationFilters.module.scss';

interface TranslationFiltersWrapperProps {
  languages: Array<{ id: number; name: string; iso_code: string }>;
  filters: FilterState;
  handlers: FilterHandlers;
  statusOptions: Array<{ value: string; label: string }>;
}

export const TranslationFiltersWrapper: React.FC<TranslationFiltersWrapperProps> = ({
  languages,
  filters,
  handlers,
  statusOptions,
}) => {
  return (
    <div className={classes.filtersContainer}>
      <div className={classes.filtersRow}>
        <div style={{ flex: 1 }}>
          <div className={classes.toolRow}>
            <TranslationFiltersComponent
              languages={languages}
              languageFilter={filters.languageFilter}
              targetLanguageFilter={filters.targetLanguageFilter}
              statusFilter={filters.statusFilter}
              startDate={filters.startDate}
              endDate={filters.endDate}
              searchTerm={filters.searchTerm}
              onLanguageChange={handlers.setLanguageFilter}
              onTargetLanguageChange={handlers.setTargetLanguageFilter}
              onStatusChange={handlers.setStatusFilter}
              onStartDateChange={handlers.setStartDate}
              onEndDateChange={handlers.setEndDate}
              onSearchChange={handlers.setSearchTerm}
              statusOptions={statusOptions}
            />
          </div>
        </div>
      </div>
      
      <FilterChips
        statusFilter={filters.statusFilter}
        languageFilter={filters.languageFilter}
        targetLanguageFilter={filters.targetLanguageFilter}
        reviewerFilter={filters.reviewerFilter}
        startDate={filters.startDate}
        endDate={filters.endDate}
        searchTerm={filters.searchTerm}
        onRemove={handlers.removeFilter}
        onClearAll={handlers.clearAllFilters}
      />
    </div>
  );
}; 