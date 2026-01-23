import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './OverviewCard.module.css';
import tableStyles from '../Table/Table.module.css';

interface OverviewCardProps {
  label: string;
  value: React.ReactNode;
  colorType?: 'green' | 'red' | 'blue';
  className?: string;
  animateOnChange?: boolean;
}

export const OverviewCard = ({
  label,
  value,
  colorType,
  className,
  animateOnChange,
}: OverviewCardProps) => {
  const [prevValue, setPrevValue] = useState<React.ReactNode>(value);
  const [blinkClass, setBlinkClass] = useState<string | null>(null);

  if (animateOnChange && value !== prevValue) {
    const prevStr = String(prevValue);
    const currStr = String(value);

    if (prevStr !== currStr) {
      const prevNum = parseFloat(prevStr.replace(/[^0-9.-]+/g, ''));
      const currNum = parseFloat(currStr.replace(/[^0-9.-]+/g, ''));

      if (!isNaN(prevNum) && !isNaN(currNum)) {
        setBlinkClass(currNum > prevNum ? tableStyles.blinkUp : tableStyles.blinkDown);
      }
    }
    setPrevValue(value);
  }

  useEffect(() => {
    if (blinkClass) {
      const timer = setTimeout(() => {
        setBlinkClass(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [blinkClass]);

  return (
    <div className={cn(styles.overviewCard, className)}>
      <span className={styles.label}>{label}</span>
      <span
        className={cn(styles.value, blinkClass, {
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
