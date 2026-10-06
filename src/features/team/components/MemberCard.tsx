import { memo } from 'react';
import { CheckSquare, FolderKanban, Mail, MapPin, UserCheck, UserX } from 'lucide-react';
import { Button, Card, IconButton, RoleBadge } from '@/components/ui';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/format';
import type { Employee } from '@/types';
import { MemberIdentity } from './MemberIdentity';
import { MemberStatusBadge } from './MemberStatusBadge';
import styles from './MemberCard.module.css';

export interface MemberRowHandlers {
  onOpen: (id: string) => void;
  onAssign?: (member: Employee) => void;
  onToggleStatus?: (member: Employee) => void;
}

interface MemberCardProps extends MemberRowHandlers {
  member: Employee;
  projectCount: number;
  openTasks: number;
  isSelf: boolean;
}

export const MemberCard = memo(function MemberCard({
  member,
  projectCount,
  openTasks,
  isSelf,
  onOpen,
  onAssign,
  onToggleStatus,
}: MemberCardProps) {
  const active = member.status === 'active';
  return (
    <Card as="article" className={cn(styles.card, !active && styles.inactive)}>
      <div className={styles.header}>
        <button type="button" className={styles.identityBtn} onClick={() => onOpen(member.id)}>
          <MemberIdentity member={member} isSelf={isSelf} size={48} subtitle={member.designation} />
        </button>
        <RoleBadge role={member.role} />
      </div>

      <div className={styles.tags}>
        <span className={styles.badgeId}>{member.employeeId}</span>
        <span className={styles.department}>{member.department}</span>
        <MemberStatusBadge member={member} />
      </div>

      <div className={styles.contact}>
        <a href={`mailto:${member.email}`} className={styles.contactLine} title={member.email}>
          <Mail size={13} />
          <span>{member.email}</span>
        </a>
        {member.location && (
          <span className={styles.contactLine}>
            <MapPin size={13} />
            <span>{member.location}</span>
          </span>
        )}
      </div>

      <div className={styles.metrics}>
        <span>
          <FolderKanban size={14} />
          {pluralize(projectCount, 'project')}
        </span>
        <span>
          <CheckSquare size={14} />
          {pluralize(openTasks, 'open task')}
        </span>
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" size="sm" className={styles.grow} onClick={() => onOpen(member.id)}>
          View profile
        </Button>
        {onAssign && (
          <Button variant="outline" size="sm" icon={FolderKanban} onClick={() => onAssign(member)}>
            Projects
          </Button>
        )}
        {onToggleStatus && !isSelf && (
          <IconButton
            icon={active ? UserX : UserCheck}
            label={active ? `Deactivate ${member.name}` : `Reactivate ${member.name}`}
            className={active ? styles.danger : styles.success}
            size={16}
            onClick={() => onToggleStatus(member)}
          />
        )}
      </div>
    </Card>
  );
});
