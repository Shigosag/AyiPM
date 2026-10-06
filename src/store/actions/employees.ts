import { createId, nowIso } from '@/lib/id';
import { toDateKey } from '@/lib/date';
import { isValidEmail } from '@/lib/validation';
import { ROLE_LABELS } from '@/constants/roles';
import type { AccessLink, ActionResult, Employee, EmployeeInput, EmployeeStatus, EmployeeUpdate, UserRole } from '@/types';
import { authorize, fail, getState, ok, setState } from '../appStore';
import { logActivity } from './activity';
import { notify } from './notifications';
import { issueInvite } from './accessLinks';

const SELF_EDITABLE_FIELDS: (keyof EmployeeUpdate)[] = ['name', 'email', 'phone', 'location', 'bio', 'avatar'];

export function findEmployeeByEmail(email: string, employees: Employee[] = getState().employees): Employee | undefined {
  const value = email.trim().toLowerCase();
  if (!value) return undefined;
  return employees.find((e) => e.email.toLowerCase() === value);
}

export function generateEmployeeId(): string {
  const { employees, workspace } = getState();
  const prefix = workspace.employeeIdPrefix;
  const max = employees.reduce((acc, e) => {
    if (!e.employeeId.toUpperCase().startsWith(prefix.toUpperCase())) return acc;
    const n = parseInt(e.employeeId.slice(prefix.length), 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function validateEmployeeIdentity(email: string, employeeId: string | undefined, excludeId?: string): string | undefined {
  const { employees } = getState();
  if (!isValidEmail(email)) return 'Enter a valid email address.';
  const normalizedEmail = email.trim().toLowerCase();
  if (employees.some((e) => e.id !== excludeId && e.email.toLowerCase() === normalizedEmail)) {
    return 'An account with this email address already exists.';
  }
  const badge = employeeId?.trim().toUpperCase();
  if (badge && employees.some((e) => e.id !== excludeId && e.employeeId.toUpperCase() === badge)) {
    return `Employee ID "${badge}" is already in use.`;
  }
  return undefined;
}

export function buildEmployee(input: EmployeeInput): Employee {
  const timestamp = nowIso();
  return {
    id: createId('emp'),
    employeeId: input.employeeId?.trim().toUpperCase() || generateEmployeeId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    department: input.department,
    designation: input.designation.trim(),
    role: input.role,
    status: 'active',
    joinDate: input.joinDate || toDateKey(),
    avatar: input.avatar,
    phone: input.phone?.trim() || undefined,
    location: input.location?.trim() || undefined,
    bio: input.bio?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function addEmployee(input: EmployeeInput): ActionResult<{ employee: Employee; invite: AccessLink }> {
  const auth = authorize('employees.manage');
  if (!auth.ok) return auth;
  const error = validateEmployeeIdentity(input.email, input.employeeId);
  if (error) return fail(error);

  const employee = buildEmployee(input);
  setState((s) => ({ employees: [...s.employees, employee] }));
  const invite = issueInvite(employee.id, auth.data.id);
  logActivity({
    actor: auth.data,
    action: 'Invited Employee',
    entityType: 'employee',
    entityId: employee.id,
    entityName: employee.name,
    details: `${employee.designation} · ${employee.employeeId}`,
  });
  return ok({ employee, invite });
}

export function updateEmployee(id: string, update: EmployeeUpdate): ActionResult<Employee> {
  const auth = authorize();
  if (!auth.ok) return auth;
  const actor = auth.data;
  const isAdmin = actor.role === 'admin';
  if (!isAdmin && actor.id !== id) return fail('You can only edit your own profile.');

  const target = getState().employees.find((e) => e.id === id);
  if (!target) return fail('Employee not found.');

  const allowed = isAdmin
    ? update
    : (Object.fromEntries(Object.entries(update).filter(([key]) => SELF_EDITABLE_FIELDS.includes(key as keyof EmployeeUpdate))) as EmployeeUpdate);

  if (allowed.email !== undefined || allowed.employeeId !== undefined) {
    const error = validateEmployeeIdentity(allowed.email ?? target.email, allowed.employeeId, id);
    if (error) return fail(error);
  }
  if (allowed.name !== undefined && !allowed.name.trim()) return fail('Name is required.');

  const updated: Employee = {
    ...target,
    ...allowed,
    email: (allowed.email ?? target.email).trim().toLowerCase(),
    employeeId: (allowed.employeeId ?? target.employeeId).trim().toUpperCase(),
    updatedAt: nowIso(),
  };
  setState((s) => ({ employees: s.employees.map((e) => (e.id === id ? updated : e)) }));
  logActivity({
    actor,
    action: actor.id === id ? 'Updated Own Profile' : 'Updated Employee Profile',
    entityType: 'employee',
    entityId: id,
    entityName: updated.name,
  });
  return ok(updated);
}

function countActiveAdmins(excludeId: string): number {
  return getState().employees.filter((e) => e.id !== excludeId && e.role === 'admin' && e.status === 'active').length;
}

export function setEmployeeRole(id: string, role: UserRole): ActionResult {
  const auth = authorize('employees.manage');
  if (!auth.ok) return auth;
  const target = getState().employees.find((e) => e.id === id);
  if (!target) return fail('Employee not found.');
  if (target.role === role) return ok();
  if (target.role === 'admin' && countActiveAdmins(id) === 0) return fail('The workspace needs at least one active admin.');

  setState((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, role, updatedAt: nowIso() } : e)) }));
  logActivity({
    actor: auth.data,
    action: 'Updated Employee Role',
    entityType: 'employee',
    entityId: id,
    entityName: target.name,
    details: `${ROLE_LABELS[target.role]} → ${ROLE_LABELS[role]}`,
  });
  notify([id], {
    title: 'Your role was updated',
    message: `${auth.data.name} changed your role to ${ROLE_LABELS[role]}.`,
    category: 'system',
    priority: 'high',
    senderId: auth.data.id,
  });
  return ok();
}

export function setEmployeeStatus(id: string, status: EmployeeStatus): ActionResult {
  const auth = authorize('employees.manage');
  if (!auth.ok) return auth;
  if (auth.data.id === id) return fail('You cannot change your own account status.');
  const target = getState().employees.find((e) => e.id === id);
  if (!target) return fail('Employee not found.');
  if (target.status === status) return ok();
  if (status === 'inactive' && target.role === 'admin' && countActiveAdmins(id) === 0) {
    return fail('The workspace needs at least one active admin.');
  }

  setState((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, status, updatedAt: nowIso() } : e)) }));
  logActivity({
    actor: auth.data,
    action: status === 'active' ? 'Reactivated Employee' : 'Deactivated Employee',
    entityType: 'employee',
    entityId: id,
    entityName: target.name,
  });
  return ok();
}

export function setEmployeeProjects(employeeId: string, projectIds: string[]): ActionResult {
  const auth = authorize('projects.manage');
  if (!auth.ok) return auth;
  const target = getState().employees.find((e) => e.id === employeeId);
  if (!target) return fail('Employee not found.');

  const wanted = new Set(projectIds);
  const { projects } = getState();
  const added = projects.filter((p) => wanted.has(p.id) && !p.members.includes(employeeId)).map((p) => p.name);
  const timestamp = nowIso();
  setState({
    projects: projects.map((p) => {
      const isMember = p.members.includes(employeeId);
      if (wanted.has(p.id) && !isMember) return { ...p, members: [...p.members, employeeId], updatedAt: timestamp };
      if (!wanted.has(p.id) && isMember) return { ...p, members: p.members.filter((m) => m !== employeeId), updatedAt: timestamp };
      return p;
    }),
  });
  logActivity({
    actor: auth.data,
    action: 'Updated Project Assignments',
    entityType: 'employee',
    entityId: employeeId,
    entityName: target.name,
    details: `Assigned to ${projectIds.length} project(s)`,
  });
  if (added.length > 0) {
    notify([employeeId], {
      title: 'Added to project',
      message: `You were added to ${added.join(', ')}.`,
      category: 'project',
      priority: 'normal',
      link: '/projects',
      senderId: auth.data.id,
    });
  }
  return ok();
}
