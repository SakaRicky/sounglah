import React from 'react';
import clsx from 'clsx';
import styles from './SounglahButton.module.scss';

type BorderRadius = 'small' | 'medium' | 'large' | 'round';

type SounglahButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  borderRadius?: BorderRadius;
  children: React.ReactNode;
};

export const SounglahButton = ({
  variant = 'primary',
  borderRadius = 'large', // default to current style
  children,
  className,
  ...props
}: SounglahButtonProps) => (
  <button
    className={clsx(
      styles.sounglahButton,
      styles[variant],
      styles[`radius-${borderRadius}`],
      className
    )}
    {...props}
  >
    {children}
  </button>
); 