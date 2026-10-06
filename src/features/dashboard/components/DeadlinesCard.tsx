import { useMemo } from 'react';
import Link from 'next/link';
import { CalendarClock, CheckSquare, FolderKanban } from 'lucide-react';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useFormatters, useProjectsById } from '@/store';
import type { Project, Task } from '@/types';
import { DeadlineLabel } from '@/features/projects/components/DeadlineLabel';
import { DEADLINE_HORIZON_DAYS, buildDeadlines } from '../utils';
import styles from './DeadlinesCard.module.css';

const LIMIT = 8;

interface DeadlinesCardProps {
  projects: Project[];
  tasks: Task[];
  personal: boolean;
}

export function DeadlinesCard({ projects, tasks, personal }: DeadlinesCardProps) {
  const projectsById = useProjectsById();
  const { date } = useFormatters();
  const items = useMemo(() => buildDeadlines(projects, tasks), [projects, tasks]);
  const visible = items.slice(0, LIMIT);

  return (
    <Card as="section">
      <CardHeader
        icon={CalendarClock}
        title="Deadlines"
        description={`Overdue and due in the next ${DEADLINE_HORIZON_DAYS} days${personal ? ' · your work' : ''}`}
      />
      {visible.length === 0 ? (
        <EmptyState compact icon={CalendarClock} title="Nothing due soon" description={`No open tasks or projects are due in the next ${DEADLINE_HORIZON_DAYS} days.`} />
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => {
            const Icon = item.kind === 'project' ? FolderKanban : CheckSquare;
            const context = item.kind === 'project' ? 'Project deadline' : projectsById.get(item.projectId ?? '')?.name ?? 'Task';
            return (
              <li key={`${item.kind}-${item.id}`}>
                <Link href={item.href} className={styles.row}>
                  <span className={cn(styles.icon, item.kind === 'project' && styles.projectIcon)}>
                    <Icon size={15} />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.context}>
                      {context} · {date(item.date)}
                    </span>
                  </span>
                  <DeadlineLabel endDate={item.date} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > LIMIT && <p className={styles.more}>+{items.length - LIMIT} more upcoming</p>}
    </Card>
  );
}
