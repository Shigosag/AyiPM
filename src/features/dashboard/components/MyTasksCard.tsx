import { useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants/navigation';
import { useFormatters, useProjectsById } from '@/store';
import type { Task } from '@/types';
import { TaskRow } from '@/features/projects/components/TaskRow';
import { compareTasksByUrgency, isOpenTask } from '../utils';
import { CardLink } from './CardLink';
import styles from './MyTasksCard.module.css';

const LIMIT = 6;

export function MyTasksCard({ tasks }: { tasks: Task[] }) {
  const projectsById = useProjectsById();
  const { date } = useFormatters();
  const open = useMemo(() => tasks.filter(isOpenTask).sort(compareTasksByUrgency), [tasks]);

  return (
    <Card as="section">
      <CardHeader
        icon={ListChecks}
        title="My tasks"
        description={open.length > 0 ? `${open.length} open ${open.length === 1 ? 'task' : 'tasks'} assigned to you` : 'Assigned to you'}
        actions={<CardLink href={ROUTES.tasks}>Open board</CardLink>}
      />
      {open.length === 0 ? (
        <EmptyState compact icon={ListChecks} title="You're all caught up" description="Tasks assigned to you will appear here, soonest due first." />
      ) : (
        <div className={styles.list}>
          {open.slice(0, LIMIT).map((task) => (
            <TaskRow key={task.id} task={task} formatDate={date} context={projectsById.get(task.projectId)?.name} showStatus hideAssignee />
          ))}
          {open.length > LIMIT && <p className={styles.more}>+{open.length - LIMIT} more on the board</p>}
        </div>
      )}
    </Card>
  );
}
