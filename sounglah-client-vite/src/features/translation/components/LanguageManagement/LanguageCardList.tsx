import React from 'react';
import { Typography, Box } from '@mui/material';
import { LanguageCard } from './LanguageCard';
import type { Language } from '../../api/languages';
import classes from './LanguageCardList.module.scss';

interface LanguageCardListProps {
  languages: Language[];
  selectedIds: Set<number>;
  onSelectLanguage: (id: number, checked: boolean) => void;
  onEditLanguage: (language: Language) => void;
  onDeleteLanguage: (language: Language) => void;
}

export const LanguageCardList: React.FC<LanguageCardListProps> = ({
  languages,
  selectedIds,
  onSelectLanguage,
  onEditLanguage,
  onDeleteLanguage,
}) => {
  if (languages.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1" color="text.secondary">
          No languages found.
        </Typography>
      </Box>
    );
  }

  return (
    <div className={classes.cardList}>
      {languages.map((language) => (
        <LanguageCard
          key={language.id}
          language={language}
          isSelected={selectedIds.has(language.id)}
          onSelect={(checked) => onSelectLanguage(language.id, checked)}
          onEdit={onEditLanguage}
          onDelete={onDeleteLanguage}
        />
      ))}
    </div>
  );
}; 