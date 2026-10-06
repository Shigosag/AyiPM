import { useMemo } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { ButtonLink, Card, CardHeader, EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants/navigation';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/constants/status';
import { useEmployeesById, useFormatters, usePermission } from '@/store';
import type { Task } from '@/types';
import { groupTasksByStatus } from '../utils';
import { TaskRow } from './TaskRow';
import styles from './ProjectTasksCard.module.css';

interface ProjectTasksCardProps {
  projectId: string;
  tasks: Task[];
}

export function ProjectTasksCard({ projectId, tasks }: ProjectTasksCardProps) {
  const canManageTasks = usePermission('tasks.manage');
  const employeesById = useEmployeesById();
  const { date } = useFormatters();
  const groups = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const addButton = canManageTasks && (
    <ButtonLink href={`${ROUTES.tasks}?project=${projectId}&new=1`} size="sm" icon={Plus}>
      Add task
    </ButtonLink>
  );

  return (
    <Card as="section">
      <CardHeader icon={CheckSquare} title="Tasks" description={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} in this project`} actions={tasks.length > 0 && addButton} />
      {tasks.length === 0 ? (
        <EmptyState
          compact
          icon={CheckSquare}
          title="No tasks yet"
          description={canManageTasks ? 'Break the project down into tasks to start tracking progress.' : 'Tasks will appear here once they are created.'}
          action={addButton}
        />
      ) : (
        <div className={styles.groups}>
          {TASK_STATUS_ORDER.map((status) =>
            groups[status].length === 0 ? null : (
              <div key={status} className={styles.group}>
                <h3 className={styles.groupTitle}>
                  <span className={styles.dot} style={{ background: TASK_STATUS[status].color }} aria-hidden />
                  {TASK_STATUS[status].label}
                  <span className={styles.groupCount}>{groups[status].length}</span>
                </h3>
                <div className={styles.rows}>
                  {groups[status].map((task) => (
                    <TaskRow key={task.id} task={task} assignee={task.assigneeId ? employeesById.get(task.assigneeId) : undefined} formatDate={date} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}
