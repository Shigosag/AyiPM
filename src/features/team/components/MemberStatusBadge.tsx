import { Badge } from '@/components/ui';
import type { Employee } from '@/types';

export function MemberStatusBadge({ member }: { member: Employee }) {
  if (member.status !== 'active') return <Badge tone="neutral">Inactive</Badge>;
  if (member.invited) return <Badge tone="warning" title="Invitation sent, not accepted yet">Invited</Badge>;
  return (
    <>
      <Badge tone="success">Active</Badge>
      {member.passwordResetRequestedAt && (
        <Badge tone="danger" title="This person asked for a password reset link. Send one from their profile.">
          Reset requested
        </Badge>
      )}
    </>
  );
}
