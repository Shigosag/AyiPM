import { SearchX } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import type { Employee, Project } from '@/types';
import type { TeamViewMode } from '../utils';
import type { MemberRowHandlers } from './MemberCard';
import { MemberGrid } from './MemberGrid';
import { MemberTable } from './MemberTable';

interface TeamMembersProps extends MemberRowHandlers {
  viewMode: TeamViewMode;
  members: Employee[];
  currentUserId: string;
  projectsByMember: Map<string, Project[]>;
  openTaskCounts: Map<string, number>;
  onResetFilters: () => void;
}

export function TeamMembers({ viewMode, onResetFilters, ...props }: TeamMembersProps) {
  if (props.members.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={SearchX}
          title="No members match these filters"
          description="Try a different search term or clear the filters to see the whole team."
          action={
            <Button variant="secondary" size="sm" onClick={onResetFilters}>
              Clear filters
            </Button>
          }
        />
      </Card>
    );
  }
  return viewMode === 'grid' ? <MemberGrid {...props} /> : <MemberTable {...props} />;
}
