import 'server-only';
import type { WorkspaceSettings } from '@/types';
import { db } from './db';
import { HttpError } from './http';
import { toWorkspaceSettings } from './mappers';

export const WORKSPACE_ID = 'default';

export async function needsSetup(): Promise<boolean> {
  return (await db.user.count()) === 0;
}

export async function getWorkspaceSettings(): Promise<WorkspaceSettings | null> {
  const workspace = await db.workspace.findUnique({ where: { id: WORKSPACE_ID } });
  return workspace ? toWorkspaceSettings(workspace) : null;
}

export async function getEmployeeIdPrefix(): Promise<string> {
  const workspace = await db.workspace.findUnique({ where: { id: WORKSPACE_ID }, select: { employeeIdPrefix: true } });
  return workspace?.employeeIdPrefix ?? 'AX';
}

function isTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export async function updateWorkspaceSettings(update: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
  const data: Record<string, string | number> = {};
  if (update.companyName !== undefined) {
    if (!update.companyName.trim()) throw new HttpError(400, 'Company name is required.');
    data.companyName = update.companyName.trim();
  }
  if (update.timezone !== undefined) data.timezone = update.timezone;
  if (update.workDayStart !== undefined) {
    if (!isTime(update.workDayStart)) throw new HttpError(400, 'Work day start must be a time like 09:00.');
    data.workDayStart = update.workDayStart;
  }
  if (update.gracePeriodMinutes !== undefined) {
    if (!Number.isInteger(update.gracePeriodMinutes) || update.gracePeriodMinutes < 0 || update.gracePeriodMinutes > 180) {
      throw new HttpError(400, 'Grace period must be between 0 and 180 minutes.');
    }
    data.gracePeriodMinutes = update.gracePeriodMinutes;
  }
  if (update.halfDayThresholdHours !== undefined) {
    if (!(update.halfDayThresholdHours > 0 && update.halfDayThresholdHours <= 12)) throw new HttpError(400, 'Half-day threshold must be between 0 and 12 hours.');
    data.halfDayThresholdHours = update.halfDayThresholdHours;
  }
  if (update.employeeIdPrefix !== undefined) {
    if (!/^[A-Za-z]{1,5}$/.test(update.employeeIdPrefix)) throw new HttpError(400, 'Employee ID prefix must be 1–5 letters.');
    data.employeeIdPrefix = update.employeeIdPrefix.toUpperCase();
  }
  const allowance = update.leaveAllowance;
  if (allowance) {
    const entries = [
      ['annualLeaveDays', allowance.annual],
      ['sickLeaveDays', allowance.sick],
      ['casualLeaveDays', allowance.casual],
    ] as const;
    for (const [key, value] of entries) {
      if (value === undefined) continue;
      if (!Number.isInteger(value) || value < 0 || value > 365) throw new HttpError(400, 'Leave allowance must be between 0 and 365 days.');
      data[key] = value;
    }
  }
  const workspace = await db.workspace.update({ where: { id: WORKSPACE_ID }, data });
  return toWorkspaceSettings(workspace);
}
