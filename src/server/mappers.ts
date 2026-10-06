import 'server-only';
import type { User, Workspace } from '@prisma/client';
import type { Employee, EmployeeStatus, UserRole, WorkspaceSettings } from '@/types';

export function toEmployee(user: User): Employee {
  return {
    id: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    department: user.department,
    designation: user.designation,
    role: user.role as UserRole,
    status: user.status as EmployeeStatus,
    joinDate: user.joinDate,
    avatar: user.avatar ?? undefined,
    phone: user.phone ?? undefined,
    location: user.location ?? undefined,
    bio: user.bio ?? undefined,
    invited: !user.passwordHash,
    passwordResetRequestedAt: user.passwordResetRequestedAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toWorkspaceSettings(workspace: Workspace): WorkspaceSettings {
  return {
    companyName: workspace.companyName,
    timezone: workspace.timezone,
    workDayStart: workspace.workDayStart,
    gracePeriodMinutes: workspace.gracePeriodMinutes,
    halfDayThresholdHours: workspace.halfDayThresholdHours,
    leaveAllowance: { annual: workspace.annualLeaveDays, sick: workspace.sickLeaveDays, casual: workspace.casualLeaveDays },
    employeeIdPrefix: workspace.employeeIdPrefix,
  };
}
