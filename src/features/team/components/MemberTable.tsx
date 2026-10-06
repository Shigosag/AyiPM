import { useMemo } from 'react';
import { FolderKanban, UserCheck, UserX } from 'lucide-react';
import { DataTable, IconButton, RoleBadge, type Column } from '@/components/ui';
import type { Employee, Project } from '@/types';
import type { MemberRowHandlers } from './MemberCard';
import { MemberIdentity } from './MemberIdentity';
import { MemberStatusBadge } from './MemberStatusBadge';
import styles from './MemberTable.module.css';

interface MemberTableProps extends MemberRowHandlers {
  members: Employee[];
  currentUserId: string;
  projectsByMember: Map<string, Project[]>;
  openTaskCounts: Map<string, number>;
}

export function MemberTable({ members, currentUserId, projectsByMember, openTaskCounts, onOpen, onAssign, onToggleStatus }: MemberTableProps) {
  const columns = useMemo<Column<Employee>[]>(() => {
    const base: Column<Employee>[] = [
      {
        key: 'member',
        header: 'Member',
        render: (m) => <MemberIdentity member={m} isSelf={m.id === currentUserId} size={36} subtitle={m.email} />,
      },
      { key: 'employeeId', header: 'Employee ID', render: (m) => <span className={styles.mono}>{m.employeeId}</span> },
      {
        key: 'designation',
        header: 'Designation',
        render: (m) => (
          <span className={styles.stack}>
            <span>{m.designation}</span>
            <span className={styles.muted}>{m.department}</span>
          </span>
        ),
      },
      { key: 'role', header: 'Role', render: (m) => <RoleBadge role={m.role} /> },
      { key: 'status', header: 'Status', render: (m) => <MemberStatusBadge member={m} /> },
      { key: 'projects', header: 'Projects', align: 'center', render: (m) => projectsByMember.get(m.id)?.length ?? 0 },
      { key: 'tasks', header: 'Open tasks', align: 'center', render: (m) => openTaskCounts.get(m.id) ?? 0 },
    ];
    if (!onAssign && !onToggleStatus) return base;
    return [
      ...base,
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (m) => (
          <span className={styles.actions} onClick={(e) => e.stopPropagation()}>
            {onAssign && <IconButton icon={FolderKanban} label={`Manage projects for ${m.name}`} size={16} onClick={() => onAssign(m)} />}
            {onToggleStatus && m.id !== currentUserId && (
              <IconButton
                icon={m.status === 'active' ? UserX : UserCheck}
                label={m.status === 'active' ? `Deactivate ${m.name}` : `Reactivate ${m.name}`}
                size={16}
                onClick={() => onToggleStatus(m)}
              />
            )}
          </span>
        ),
      },
    ];
  }, [currentUserId, projectsByMember, openTaskCounts, onAssign, onToggleStatus]);

  return (
    <DataTable
      caption="Team members"
      columns={columns}
      rows={members}
      rowKey={(m) => m.id}
      onRowClick={(m) => onOpen(m.id)}
      minWidth={960}
    />
  );
}
