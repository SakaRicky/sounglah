import React from 'react';
import { StatCard } from '@/components/atoms/StatCard';
import type { Translation } from '../../api/types';
import classes from './TranslationStats.module.scss';
import DoneIcon from '@mui/icons-material/Done';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TranslationStatsProps {
  translations: Translation[];
}

export const TranslationStats = React.memo<TranslationStatsProps>(({ translations }) => {
  const totalTranslations = translations.length;
  const approvedCount = translations.filter(t => t.status === 'approved').length;
  const rejectedCount = translations.filter(t => t.status === 'rejected').length;
  const pendingCount = translations.filter(t => t.status === 'pending').length;

  return (
    <section 
      className={classes.statsGrid}
      aria-labelledby="translation-stats-heading"
      role="region"
    >
      <h2 id="translation-stats-heading" className="sr-only">
        Translation Statistics
      </h2>
      <div className={classes.statCard}>
        <StatCard
          icon={<LanguageIcon style={{ color: 'var(--mantine-color-brown-5)', fontSize: 22 }} aria-hidden="true" />}
          label="Translations"
          value={totalTranslations}
          ariaLabel={`Total translations: ${totalTranslations}`}
        />
      </div>
      <div className={classes.statCard}>
        <StatCard
          icon={<DoneIcon style={{ color: 'var(--mantine-color-green-7)', fontSize: 22 }} aria-hidden="true" />}
          label="Approved"
          value={approvedCount}
          ariaLabel={`Approved translations: ${approvedCount} out of ${totalTranslations}`}
        />
      </div>
      <div className={classes.statCard}>
        <StatCard
          icon={<CloseIcon style={{ color: 'var(--mantine-color-green-7)', fontSize: 22 }} aria-hidden="true" />}
          label="Rejected"
          value={rejectedCount}
          ariaLabel={`Rejected translations: ${rejectedCount} out of ${totalTranslations}`}
        />
      </div>
      <div className={classes.statCard}>
        <StatCard
          icon={<AccessTimeIcon style={{ color: 'var(--mantine-color-orange-7)', fontSize: 22 }} aria-hidden="true" />}
          label="Pending"
          value={pendingCount}
          ariaLabel={`Pending translations: ${pendingCount} out of ${totalTranslations}`}
        />
      </div>
    </section>
  );
});

TranslationStats.displayName = 'TranslationStats'; 