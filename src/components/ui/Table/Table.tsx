import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './Table.module.css';
import { formatMoney, formatNumber, formatPercent } from '../../../utils/format';

interface BaseCellProps {
  children?: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export const Th = ({
  children,
  align = 'left',
  className,
  ...props
}: BaseCellProps & React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    {...props}
    className={cn(
      styles.headerCell,
      {
        [styles.textRight]: align === 'right',
        [styles.textCenter]: align === 'center',
      },
      className,
    )}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  align = 'left',
  mono = false,
  bold = false,
  className,
  ...props
}: BaseCellProps & {
  mono?: boolean;
  bold?: boolean;
} & React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    {...props}
    className={cn(
      styles.dataCell,
      {
        [styles.textRight]: align === 'right',
        [styles.textCenter]: align === 'center',
        [styles.fontMono]: mono,
        [styles.fontBold]: bold,
      },
      className,
    )}
  >
    {children}
  </td>
);

interface ValCellProps extends Omit<BaseCellProps, 'children'> {
  value: number;
  bold?: boolean;
}

export const MoneyTd = ({
  value,
  colored = false,
  ...props
}: ValCellProps & { colored?: boolean }) => {
  const colorClass = colored
    ? value > 0
      ? styles.textGreen
      : value < 0
        ? styles.textRed
        : undefined
    : undefined;

  return (
    <Td align="right" mono {...props} className={cn(colorClass, props.className)}>
      {formatMoney(value)}
    </Td>
  );
};

export const RealtimeMoneyTd = ({
  value,
  colored = false,
  ...props
}: ValCellProps & { colored?: boolean }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [blinkClass, setBlinkClass] = useState<string | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setBlinkClass(value > prevValue ? styles.blinkUp : styles.blinkDown);
  }

  useEffect(() => {
    if (blinkClass) {
      const timer = setTimeout(() => {
        setBlinkClass(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [blinkClass]);

  const colorClass = colored
    ? value > 0
      ? styles.textGreen
      : value < 0
        ? styles.textRed
        : undefined
    : undefined;

  return (
    <Td align="right" mono {...props} className={cn(blinkClass, colorClass, props.className)}>
      {formatMoney(value)}
    </Td>
  );
};

export const NumberTd = ({
  value,
  colorType,
  ...props
}: ValCellProps & { colorType?: 'blue' | 'greenRed' }) => {
  const colorClass =
    colorType === 'blue' && value > 0
      ? styles.textBlue
      : colorType === 'greenRed'
        ? value > 0
          ? styles.textGreen
          : value < 0
            ? styles.textRed
            : undefined
        : undefined;

  return (
    <Td align="right" mono {...props} className={cn(colorClass, props.className)}>
      {formatNumber(value)}
    </Td>
  );
};

export const PercentTd = ({
  value,
  colored = false,
  ...props
}: ValCellProps & { colored?: boolean }) => {
  const colorClass = colored
    ? value > 0
      ? styles.textGreen
      : value < 0
        ? styles.textRed
        : undefined
    : undefined;

  return (
    <Td align="right" mono {...props} className={cn(colorClass, props.className)}>
      {formatPercent(value)}
    </Td>
  );
};
