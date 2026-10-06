'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { SettingsSectionMeta } from '../constants';
import { useActiveSection } from '../hooks/useActiveSection';
import styles from './SettingsNav.module.css';

export function SettingsNav({ sections }: { sections: SettingsSectionMeta[] }) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const active = useActiveSection(ids);

  return (
    <nav className={styles.nav} aria-label="Settings sections">
      {sections.map(({ id, label, icon: Icon }) => (
        <a key={id} href={`#${id}`} className={cn(styles.link, active === id && styles.active)} aria-current={active === id ? 'true' : undefined}>
          <Icon size={16} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
