import 'server-only';
import type { User } from '@prisma/client';
import type { BootstrapPayload } from '@/types';
import { db } from './db';
import { toEmployee } from './mappers';
import { getWorkspaceSettings, needsSetup } from './workspace';

export async function signedOutPayload(): Promise<BootstrapPayload> {
  return { needsSetup: await needsSetup(), user: null, expiresAt: null, workspace: null, employees: [] };
}

export async function signedInPayload(user: User, expiresAt: Date): Promise<BootstrapPayload> {
  const [workspace, users] = await Promise.all([getWorkspaceSettings(), db.user.findMany({ orderBy: { createdAt: 'asc' } })]);
  return { needsSetup: false, user: toEmployee(user), expiresAt: expiresAt.toISOString(), workspace, employees: users.map(toEmployee) };
}
