import { RoleBadge } from '@/components/ui';
import type { Employee } from '@/types';
import { MemberIdentity } from './MemberIdentity';
import { MemberStatusBadge } from './MemberStatusBadge';
import styles from './MemberProfileHeader.module.css';

export function MemberProfileHeader({ member, isSelf }: { member: Employee; isSelf: boolean }) {
  return (
    <div className={styles.hero}>
      <MemberIdentity member={member} isSelf={isSelf} size={64} large subtitle={`${member.designation} · ${member.department}`} />
      <div className={styles.badges}>
        <span className={styles.badgeId}>{member.employeeId}</span>
        <RoleBadge role={member.role} />
        <MemberStatusBadge member={member} />
      </div>
    </div>
  );
}
