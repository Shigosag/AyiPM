import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<V extends string> {
  value: V;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface SegmentedControlProps<V extends string> {
  options: SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  label: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<V extends string>({ options, value, onChange, label, size = 'md' }: SegmentedControlProps<V>) {
  return (
    <div className={cn(styles.group, size === 'sm' && styles.sm)} role="tablist" aria-label={label}>
      {options.map(({ value: v, label: text, count, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(styles.option, active && styles.active)}
            onClick={() => onChange(v)}
          >
            {Icon && <Icon size={14} />}
            <span>{text}</span>
            {count !== undefined && <span className={styles.count}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
