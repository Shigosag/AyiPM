import { useMemo } from 'react';
import { CheckSquare, Clock, FolderKanban, PlaneTakeoff } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui';
import { ATTENDANCE_STATUS } from '@/constants/status';
import { toDateKey } from '@/lib/date';
import { percent, pluralize } from '@/lib/format';
import {
  computeLeaveBalance,
  selectActiveEmployees,
  selectTodayAttendanceCount,
  useAppStore,
  useCurrentUser,
  useLeaveRequests,
  usePermission,
  useWorkspace,
} from '@/store';
import { usePendingApprovals } from '../hooks/usePendingApprovals';
import type { DashboardScope } from '../hooks/useDashboardScope';
import { isOpenTask, isTaskOverdue } from '../utils';

function AttendanceStat() {
  const me = useCurrentUser();
  const seesAll = usePermission('attendance.viewAll');
  const present = useAppStore(selectTodayAttendanceCount);
  const active = useAppStore((s) => selectActiveEmployees(s.employees).length);
  const myStatus = useAppStore((s) => {
    const today = toDateKey();
    return s.attendance.find((a) => a.employeeId === me.id && a.date === today)?.status;
  });

  if (seesAll) {
    return (
      <StatCard
        label="Attendance today"
        value={`${present}/${active}`}
        icon={Clock}
        accent="var(--success)"
        hint={active > 0 ? `${percent(present, active)}% of active members checked in` : 'No active members yet'}
      />
    );
  }
  return (
    <StatCard
      label="My attendance today"
      value={myStatus ? ATTENDANCE_STATUS[myStatus].label : 'Not checked in'}
      icon={Clock}
      accent="var(--success)"
      hint={myStatus ? 'Recorded for today' : 'Use Check In in the top bar to start your day'}
    />
  );
}

function PendingApprovalsStat() {
  const pending = usePendingApprovals();
  return (
    <StatCard
      label="Pending leave approvals"
      value={pending.length}
      icon={PlaneTakeoff}
      accent="var(--warning)"
      hint={pending.length > 0 ? 'Awaiting your review' : 'Nothing waiting on you'}
    />
  );
}

function LeaveBalanceStat() {
  const me = useCurrentUser();
  const requests = useLeaveRequests();
  const { leaveAllowance } = useWorkspace();
  const balance = useMemo(() => computeLeaveBalance(requests, me.id, leaveAllowance), [requests, me.id, leaveAllowance]);
  const remaining = (b: { total: number; used: number }) => Math.max(0, b.total - b.used);
  return (
    <StatCard
      label="Annual leave remaining"
      value={`${remaining(balance.annual)} / ${balance.annual.total}`}
      icon={PlaneTakeoff}
      accent="var(--accent-strong)"
      hint={`${remaining(balance.sick)} sick · ${remaining(balance.casual)} casual days left`}
    />
  );
}

export function DashboardStats({ scope }: { scope: DashboardScope }) {
  const canReview = usePermission('leave.review');
  const { projects, tasks, seesAllProjects, seesAllTasks } = scope;

  const projectStats = useMemo(() => {
    const active = projects.filter((p) => p.status !== 'completed').length;
    return { active, completed: projects.length - active };
  }, [projects]);

  const taskStats = useMemo(() => {
    const now = new Date();
    let open = 0;
    let overdue = 0;
    tasks.forEach((t) => {
      if (isOpenTask(t)) open += 1;
      if (isTaskOverdue(t, now)) overdue += 1;
    });
    return { open, overdue };
  }, [tasks]);

  return (
    <StatGrid>
      <StatCard
        label={seesAllProjects ? 'Active projects' : 'My active projects'}
        value={projectStats.active}
        icon={FolderKanban}
        hint={projects.length > 0 ? `${projectStats.completed} completed · ${pluralize(projects.length, 'project')} total` : 'No projects yet'}
      />
      <StatCard
        label={seesAllTasks ? 'Open tasks' : 'My open tasks'}
        value={taskStats.open}
        icon={CheckSquare}
        accent="var(--accent-soft)"
        hint={taskStats.overdue > 0 ? <span className="text-danger">{taskStats.overdue} overdue</span> : 'Nothing overdue'}
      />
      <AttendanceStat />
      {canReview ? <PendingApprovalsStat /> : <LeaveBalanceStat />}
    </StatGrid>
  );
}
