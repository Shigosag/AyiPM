import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
  accent?: string;
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'var(--primary)' }: StatCardProps) {
  return (
    <div className={`card ${styles.stat}`} style={{ borderTopColor: accent }}>
      <div className={styles.top}>
        <span className="heading-sm">{label}</span>
        <Icon size={18} color={accent} />
      </div>
      <div className={styles.value}>{value}</div>
      {hint && <div className="subtext">{hint}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
