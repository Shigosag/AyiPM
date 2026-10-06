import { FolderKanban, Shield, UserCheck, Users } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui';
import { percent, pluralize } from '@/lib/format';
import type { TeamStats as TeamStatsData } from '../utils';
import styles from './TeamStats.module.css';

export function TeamStats({ stats }: { stats: TeamStatsData }) {
  return (
    <StatGrid>
      <StatCard
        label="Total members"
        value={stats.total}
        icon={Users}
        hint={stats.inactive > 0 ? pluralize(stats.inactive, 'inactive account') : 'Everyone is active'}
      />
      <StatCard
        label="Active"
        value={stats.active}
        icon={UserCheck}
        accent="var(--success)"
        hint={`${percent(stats.active, stats.total)}% of the workspace`}
      />
      <StatCard
        label="Roles"
        icon={Shield}
        accent="var(--warning)"
        value={
          <span className={styles.roles}>
            <span className="badge badge-role-admin">{pluralize(stats.admins, 'Admin')}</span>
            <span className="badge badge-role-pm">{pluralize(stats.managers, 'PM')}</span>
            <span className="badge badge-role-employee">{pluralize(stats.staff, 'Employee')}</span>
          </span>
        }
      />
      <StatCard
        label="Allocated to projects"
        value={`${stats.allocated}/${stats.total}`}
        icon={FolderKanban}
        accent="var(--accent-strong)"
        hint={`${percent(stats.allocated, stats.total)}% assigned to at least one project`}
      />
    </StatGrid>
  );
}
