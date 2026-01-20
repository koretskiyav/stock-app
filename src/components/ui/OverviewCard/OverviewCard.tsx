import React from 'react';
import cn from 'classnames';
import styles from './OverviewCard.module.css';

interface OverviewCardProps {
  label: string;
  value: React.ReactNode;
  colorType?: 'green' | 'red' | 'blue';
  className?: string;
}

export const OverviewCard = ({ label, value, colorType, className }: OverviewCardProps) => {
  return (
    <div className={cn(styles.overviewCard, className)}>
      <span className={styles.label}>{label}</span>
      <span
        className={cn(styles.value, {
          [styles.textGreen]: colorType === 'green',
          [styles.textRed]: colorType === 'red',
          [styles.textBlue]: colorType === 'blue',
        })}
      >
        {value}
      </span>
    </div>
  );
};

export const OverviewGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn(styles.overviewGrid, className)}>{children}</div>;
};
