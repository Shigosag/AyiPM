import type { LucideIcon } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { percent, pluralize } from '@/lib/format';
import styles from './LeaveBalanceCard.module.css';

interface LeaveBalanceCardProps {
  label: string;
  icon: LucideIcon;
  accent: string;
  total: number;
  used: number;
  pending: number;
}

export function LeaveBalanceCard({ label, icon: Icon, accent, total, used, pending }: LeaveBalanceCardProps) {
  const remaining = Math.max(0, total - used);
  return (
    <div className={`card ${styles.card}`} style={{ borderTopColor: accent }}>
      <div className={styles.top}>
        <span className="heading-sm">{label}</span>
        <Icon size={18} color={accent} />
      </div>
      <div className={styles.value}>
        {remaining}
        <span className={styles.of}> / {total} days left</span>
      </div>
      <ProgressBar value={percent(used, total)} label={`${label} used`} color={accent} />
      <div className={styles.meta}>
        <span>{pluralize(used, 'day')} used this year</span>
        {pending > 0 && <span className={styles.pending}>{pluralize(pending, 'day')} pending</span>}
      </div>
    </div>
  );
}
