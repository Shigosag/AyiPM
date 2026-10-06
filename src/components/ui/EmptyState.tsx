import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={compact ? `${styles.empty} ${styles.compact}` : styles.empty}>
      <span className={styles.icon}>
        <Icon size={compact ? 20 : 26} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
