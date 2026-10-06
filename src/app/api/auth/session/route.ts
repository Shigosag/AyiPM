import { signedInPayload, signedOutPayload } from '@/server/bootstrap';
import { handle, ok } from '@/server/http';
import { getSession } from '@/server/session';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const session = await getSession();
  return ok(session ? await signedInPayload(session.user, session.expiresAt) : await signedOutPayload());
});
