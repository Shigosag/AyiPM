import { nowIso } from '@/lib/id';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import type { AccessLink, ActionResult, Employee, LoginAttempt } from '@/types';
import { authorize, fail, getState, ok, setState } from '../appStore';
import { isSessionActive } from '../session';
import { logActivity } from './activity';
import { notify, recipientsWithPermission } from './notifications';
import { findEmployeeByEmail } from './employees';
import { issueInvite, issueResetLink } from './accessLinks';

const MINUTE = 60_000;
const SESSION_TTL_MS = 12 * 60 * MINUTE;
const REMEMBERED_SESSION_TTL_MS = 30 * 24 * 60 * MINUTE;
const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * MINUTE;
const LOCKOUT_MS = 15 * MINUTE;
const INVALID_CREDENTIALS = 'Incorrect email or password.';
const DUMMY_SALT = '0'.repeat(32);
const DUMMY_HASH = '0'.repeat(64);

function attemptKey(email: string, employee = findEmployeeByEmail(email)): string {
  return employee ? `user:${employee.id}` : `email:${email.trim().toLowerCase()}`;
}

function lockedMessage(remainingMs: number): string {
  const minutes = Math.max(1, Math.ceil(remainingMs / MINUTE));
  return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}, or ask your admin for a reset link.`;
}

export function getLockoutRemainingMs(identifier: string, now: number = Date.now()): number {
  const lockedUntil = getState().loginAttempts[attemptKey(identifier)]?.lockedUntil;
  return lockedUntil ? Math.max(0, Date.parse(lockedUntil) - now) : 0;
}

function recordFailedAttempt(key: string, employee: Employee | undefined): boolean {
  const now = Date.now();
  const previous = getState().loginAttempts[key];
  const withinWindow = previous && now - Date.parse(previous.firstFailedAt) < ATTEMPT_WINDOW_MS;
  const failures = withinWindow ? previous.failures + 1 : 1;
  const locked = failures >= MAX_FAILED_ATTEMPTS;
  const attempt: LoginAttempt = {
    failures: locked ? 0 : failures,
    firstFailedAt: withinWindow ? previous.firstFailedAt : new Date(now).toISOString(),
    lockedUntil: locked ? new Date(now + LOCKOUT_MS).toISOString() : undefined,
  };
  setState((s) => ({ loginAttempts: { ...s.loginAttempts, [key]: attempt } }));

  if (locked && employee) {
    logActivity({ actor: employee, action: 'Sign-in Locked', entityType: 'auth', entityId: employee.id, entityName: employee.name, details: `${MAX_FAILED_ATTEMPTS} failed attempts` });
    notify([employee.id], {
      title: 'Sign-in temporarily locked',
      message: `Your account was locked for ${LOCKOUT_MS / MINUTE} minutes after ${MAX_FAILED_ATTEMPTS} failed sign-in attempts. If this wasn't you, tell your admin.`,
      category: 'system',
      priority: 'high',
    });
  }
  return locked;
}

function clearAttempts(key: string) {
  setState((s) => {
    if (!s.loginAttempts[key]) return null;
    const { [key]: _cleared, ...rest } = s.loginAttempts;
    return { loginAttempts: rest };
  });
}

function startSession(employee: Employee, remember: boolean) {
  const now = Date.now();
  setState({
    session: {
      userId: employee.id,
      signedInAt: new Date(now).toISOString(),
      expiresAt: new Date(now + (remember ? REMEMBERED_SESSION_TTL_MS : SESSION_TTL_MS)).toISOString(),
    },
  });
}

export async function login(identifier: string, password: string, remember = false): Promise<ActionResult<Employee>> {
  const employee = findEmployeeByEmail(identifier);
  const key = attemptKey(identifier, employee);
  const remaining = getLockoutRemainingMs(identifier);
  if (remaining > 0) return fail(lockedMessage(remaining));

  const credential = employee ? getState().credentials[employee.id] : undefined;
  const valid = credential
    ? await verifyPassword(password, credential.salt, credential.hash)
    : (await verifyPassword(password, DUMMY_SALT, DUMMY_HASH), false);

  if (!valid || !employee) {
    const locked = recordFailedAttempt(key, employee);
    return fail(locked ? lockedMessage(LOCKOUT_MS) : INVALID_CREDENTIALS);
  }
  if (employee.status === 'inactive') return fail('This account has been deactivated. Contact your administrator.');

  clearAttempts(key);
  startSession(employee, remember);
  logActivity({ actor: employee, action: 'Signed In', entityType: 'auth', entityId: employee.id, entityName: employee.name });
  return ok(employee);
}

export function logout(): void {
  const auth = authorize();
  if (auth.ok) {
    logActivity({ actor: auth.data, action: 'Signed Out', entityType: 'auth', entityId: auth.data.id, entityName: auth.data.name });
  }
  setState({ session: null });
}

export function expireSessionIfNeeded(): void {
  const { session } = getState();
  if (session && !isSessionActive(session)) setState({ session: null });
}

// Always succeeds so the form never reveals which accounts exist.
export function requestPasswordReset(identifier: string): ActionResult {
  const employee = findEmployeeByEmail(identifier);
  if (employee && employee.status === 'active') {
    notify(recipientsWithPermission('employees.manage', employee.id), {
      title: 'Password reset requested',
      message: `${employee.name} (${employee.employeeId}) can't sign in and asked for a password reset link.`,
      category: 'system',
      priority: 'high',
      link: `/team?member=${employee.id}`,
      senderId: employee.id,
    });
  }
  return ok();
}

export function sendPasswordResetLink(employeeId: string): ActionResult<AccessLink> {
  const auth = authorize('employees.manage');
  if (!auth.ok) return auth;
  const { employees, credentials } = getState();
  const target = employees.find((e) => e.id === employeeId);
  if (!target) return fail('Employee not found.');
  if (target.status !== 'active') return fail('Reactivate this account before sending a reset link.');
  if (!credentials[employeeId]) return fail('This person has not accepted their invitation yet. Share a new invite link instead.');

  const link = issueResetLink(employeeId);
  logActivity({ actor: auth.data, action: 'Issued Password Reset Link', entityType: 'auth', entityId: employeeId, entityName: target.name });
  return ok(link);
}

export function regenerateInvite(employeeId: string): ActionResult<AccessLink> {
  const auth = authorize('employees.manage');
  if (!auth.ok) return auth;
  const { employees, credentials } = getState();
  const target = employees.find((e) => e.id === employeeId);
  if (!target) return fail('Employee not found.');
  if (credentials[employeeId]) return fail('This person has already joined. Send a password reset link instead.');

  const link = issueInvite(employeeId, auth.data.id);
  logActivity({ actor: auth.data, action: 'Issued Invitation Link', entityType: 'employee', entityId: employeeId, entityName: target.name });
  return ok(link);
}

export function getResetTokenOwner(token: string): Employee | undefined {
  const { passwordResets, employees } = getState();
  const entry = passwordResets.find((r) => r.token === token);
  if (!entry || Date.parse(entry.expiresAt) < Date.now()) return undefined;
  return employees.find((e) => e.id === entry.userId && e.status === 'active');
}

export function getInvite(token: string): { employee: Employee; expiresAt: string } | undefined {
  const { invites, employees, credentials } = getState();
  const entry = invites.find((i) => i.token === token);
  if (!entry || Date.parse(entry.expiresAt) < Date.now() || credentials[entry.userId]) return undefined;
  const employee = employees.find((e) => e.id === entry.userId && e.status === 'active');
  return employee ? { employee, expiresAt: entry.expiresAt } : undefined;
}

export async function acceptInvite(token: string, password: string): Promise<ActionResult<Employee>> {
  const invite = getInvite(token);
  if (!invite) return fail('This invitation is invalid or has expired. Ask your admin for a new link.');
  if (password.length < 8) return fail('Password must be at least 8 characters.');

  const { employee } = invite;
  const inviter = getState().invites.find((i) => i.token === token)?.createdBy;
  const { salt, hash } = await hashPassword(password);
  setState((s) => ({
    credentials: { ...s.credentials, [employee.id]: { salt, hash, updatedAt: nowIso() } },
    invites: s.invites.filter((i) => i.userId !== employee.id),
  }));
  startSession(employee, false);
  logActivity({ actor: employee, action: 'Accepted Invitation', entityType: 'auth', entityId: employee.id, entityName: employee.name });
  if (inviter && inviter !== employee.id) {
    notify([inviter], {
      title: 'Invitation accepted',
      message: `${employee.name} joined the workspace.`,
      category: 'system',
      priority: 'normal',
      link: `/team?member=${employee.id}`,
      senderId: employee.id,
    });
  }
  return ok(employee);
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  const employee = getResetTokenOwner(token);
  if (!employee) return fail('This reset link is invalid or has expired. Ask your admin for a new one.');
  if (newPassword.length < 8) return fail('Password must be at least 8 characters.');

  const { salt, hash } = await hashPassword(newPassword);
  setState((s) => {
    const { [`user:${employee.id}`]: _cleared, ...loginAttempts } = s.loginAttempts;
    return {
      credentials: { ...s.credentials, [employee.id]: { salt, hash, updatedAt: nowIso() } },
      passwordResets: s.passwordResets.filter((r) => r.userId !== employee.id),
      loginAttempts,
    };
  });
  logActivity({ actor: employee, action: 'Reset Password', entityType: 'auth', entityId: employee.id, entityName: employee.name });
  notify([employee.id], {
    title: 'Password changed',
    message: 'Your account password was reset. If this was not you, contact your administrator.',
    category: 'system',
    priority: 'high',
  });
  return ok();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ActionResult> {
  const auth = authorize();
  if (!auth.ok) return auth;
  const credential = getState().credentials[auth.data.id];
  if (!credential || !(await verifyPassword(currentPassword, credential.salt, credential.hash))) {
    return fail('Current password is incorrect.');
  }
  if (newPassword.length < 8) return fail('New password must be at least 8 characters.');
  if (newPassword === currentPassword) return fail('New password must be different from the current one.');

  const { salt, hash } = await hashPassword(newPassword);
  setState((s) => ({ credentials: { ...s.credentials, [auth.data.id]: { salt, hash, updatedAt: nowIso() } } }));
  logActivity({ actor: auth.data, action: 'Changed Password', entityType: 'auth', entityId: auth.data.id, entityName: auth.data.name });
  return ok();
}
