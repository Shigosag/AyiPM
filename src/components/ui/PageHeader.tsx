import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}

export function PageHeader({ title, description, icon: Icon, eyebrow, actions, back }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {back}
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={`heading-xl ${styles.title}`}>
          {Icon && <Icon size={28} className={styles.icon} />}
          <span>{title}</span>
        </h1>
        {description && <p className="subtext">{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
