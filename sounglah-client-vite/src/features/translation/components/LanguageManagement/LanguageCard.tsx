import React from 'react';
import { Card, CardContent, Typography, IconButton, Tooltip, Checkbox } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Language } from '../../api/languages';
import classes from './LanguageCard.module.scss';

interface LanguageCardProps {
  language: Language;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (language: Language) => void;
  onDelete: (language: Language) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className={classes.languageCard}>
      <CardContent className={classes.cardContent}>
        <div className={classes.cardHeader}>
          <div className={classes.languageInfo}>
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              aria-label={`Select language ${language.name}`}
              size="small"
              sx={{
                color: 'var(--mantine-color-brown-9)',
                '&.Mui-checked': {
                  color: 'var(--mantine-color-brown-9)',
                },
              }}
            />
            <div className={classes.languageDetails}>
              <div className={classes.languageName}>
                <LanguageIcon className={classes.languageIcon} />
                <Typography variant="h6" component="span">
                  {language.name}
                </Typography>
              </div>
              <div className={classes.languageMeta}>
                <div className={classes.isoCode}>
                  <Typography variant="body2" component="span" className={classes.isoCodeText}>
                    {language.iso_code || '-'}
                  </Typography>
                </div>
                <div className={classes.region}>
                  <Typography variant="body2" component="span">
                    {language.region || '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.actions}>
            <Tooltip title={`Edit language ${language.name}`}>
              <IconButton
                onClick={() => onEdit(language)}
                size="medium"
                className={classes.editButton}
                aria-label={`Edit language ${language.name}`}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Delete language ${language.name}`}>
              <IconButton
                onClick={() => onDelete(language)}
                size="medium"
                className={classes.deleteButton}
                aria-label={`Delete language ${language.name}`}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        {language.description && (
          <div className={classes.description}>
            <Typography variant="body2" component="p">
              {language.description}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 