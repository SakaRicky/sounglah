import React from 'react';
import styles from './StatCard.module.scss';

interface StatCardProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string | number;
  type?: 'default' | 'success' | 'warning' | 'info' | 'error';
  trend?: 'up' | 'down' | 'neutral';
  ariaLabel?: string; // For screen reader accessibility
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  type = 'default',
  trend,
  ariaLabel 
}) => (
  <div 
    className={`${styles.statCard} ${styles[type]} ${trend ? styles[`trend${trend.charAt(0).toUpperCase() + trend.slice(1)}`] : ''}`}
    role="region"
    aria-label={ariaLabel}
  >
    {/* Decorative border accent */}
    <div className={styles.borderAccent} />
    
    {/* Icon container */}
    <div className={styles.iconContainer}>
      {icon}
    </div>
    
    {/* Content */}
    <div className={styles.content}>
      <div className={styles.labelContainer}>
        <span className={styles.statLabel}>{label}</span>
        {trend && (
          <span className={styles.trendIndicator}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'neutral' && '→'}
          </span>
        )}
      </div>
      <div className={styles.valueContainer}>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
    
    {/* Background pattern overlay */}
    <div className={styles.patternOverlay} />
  </div>
); 