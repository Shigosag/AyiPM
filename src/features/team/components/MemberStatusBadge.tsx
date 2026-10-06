import { Badge } from '@/components/ui';
import { useIsPendingInvite } from '@/store';
import type { Employee } from '@/types';

export function MemberStatusBadge({ member }: { member: Employee }) {
  const pending = useIsPendingInvite(member.id);
  if (member.status !== 'active') return <Badge tone="neutral">Inactive</Badge>;
  if (pending) return <Badge tone="warning" title="Invitation sent, not accepted yet">Invited</Badge>;
  return <Badge tone="success">Active</Badge>;
}
