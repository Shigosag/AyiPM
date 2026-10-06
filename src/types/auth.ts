export interface Credential {
  salt: string;
  hash: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  signedInAt: string;
  expiresAt: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface InviteToken {
  token: string;
  userId: string;
  createdBy: string;
  expiresAt: string;
}

export interface LoginAttempt {
  failures: number;
  firstFailedAt: string;
  lockedUntil?: string;
}

export interface AccessLink {
  token: string;
  expiresAt: string;
}

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };
