import { createId } from '@/lib/id';
import type { AccessLink } from '@/types';
import { setState } from '../appStore';

const MINUTE = 60_000;
export const RESET_LINK_TTL_MS = 30 * MINUTE;
export const INVITE_LINK_TTL_MS = 7 * 24 * 60 * MINUTE;

export function issueResetLink(userId: string): AccessLink {
  const token = createId('rst');
  const now = Date.now();
  const expiresAt = new Date(now + RESET_LINK_TTL_MS).toISOString();
  setState((s) => ({
    passwordResets: [...s.passwordResets.filter((r) => r.userId !== userId && Date.parse(r.expiresAt) > now), { token, userId, expiresAt }],
  }));
  return { token, expiresAt };
}

export function issueInvite(userId: string, createdBy: string): AccessLink {
  const token = createId('inv');
  const now = Date.now();
  const expiresAt = new Date(now + INVITE_LINK_TTL_MS).toISOString();
  setState((s) => ({
    invites: [...s.invites.filter((i) => i.userId !== userId && Date.parse(i.expiresAt) > now), { token, userId, createdBy, expiresAt }],
  }));
  return { token, expiresAt };
}
