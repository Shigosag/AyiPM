'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FolderSearch } from 'lucide-react';
import { ButtonLink, Card, EmptyState } from '@/components/ui';
import { useConfirm } from '@/components/feedback/ConfirmProvider';
import { useToast } from '@/components/feedback/ToastProvider';
import { ROUTES } from '@/constants/navigation';
import { pluralize } from '@/lib/format';
import { deleteProject, usePermission } from '@/store';
import { useProject, useProjectTasks } from '../hooks/useProjectDetails';
import { ProjectActivityCard } from './ProjectActivityCard';
import { ProjectDeadlineCard } from './ProjectDeadlineCard';
import { ProjectDetailsHeader } from './ProjectDetailsHeader';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectInfoCard } from './ProjectInfoCard';
import { ProjectProgressCard } from './ProjectProgressCard';
import { ProjectTasksCard } from './ProjectTasksCard';
import { ProjectTeamCard } from './ProjectTeamCard';
import styles from './ProjectDetailsView.module.css';

type EditMode = 'closed' | 'details' | 'members';

export function ProjectDetailsView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const canManage = usePermission('projects.manage');
  const project = useProject(projectId);
  const tasks = useProjectTasks(projectId);
  const [editMode, setEditMode] = useState<EditMode>('closed');
  const leavingRef = useRef(false);

  const closeEditor = useCallback(() => setEditMode('closed'), []);

  const handleDelete = useCallback(async () => {
    if (!project) return;
    const confirmed = await confirm({
      title: 'Delete project?',
      message: `“${project.name}” and its ${pluralize(tasks.length, 'task')} will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete project',
      tone: 'danger',
    });
    if (!confirmed) return;
    leavingRef.current = true;
    const result = deleteProject(project.id);
    if (!result.ok) {
      leavingRef.current = false;
      toast.error(result.error);
      return;
    }
    toast.success('Project deleted');
    router.push(ROUTES.projects);
  }, [project, tasks.length, confirm, toast, router]);

  if (!project) {
    if (leavingRef.current) return null;
    return (
      <div className="page-container">
        <Card>
          <EmptyState
            icon={FolderSearch}
            title="Project not found"
            description="This project may have been deleted, or the link is incorrect."
            action={
              <ButtonLink href={ROUTES.projects} variant="secondary" icon={ArrowLeft}>
                Back to projects
              </ButtonLink>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ProjectDetailsHeader project={project} canManage={canManage} onEdit={() => setEditMode('details')} onDelete={handleDelete} />

      <div className={styles.layout}>
        <div className={styles.main}>
          <ProjectInfoCard project={project} />
          <ProjectProgressCard projectId={project.id} tasks={tasks} />
          <ProjectTasksCard projectId={project.id} tasks={tasks} />
        </div>
        <aside className={styles.side}>
          <ProjectDeadlineCard project={project} />
          <ProjectTeamCard project={project} canManage={canManage} onManage={() => setEditMode('members')} />
          <ProjectActivityCard projectId={project.id} tasks={tasks} />
        </aside>
      </div>

      {canManage && (
        <ProjectFormModal isOpen={editMode !== 'closed'} onClose={closeEditor} project={project} focusMembers={editMode === 'members'} />
      )}
    </div>
  );
}
