import { authenticate } from '@/server/auth';
import { signedInPayload } from '@/server/bootstrap';
import { handle, ok, readJson, str } from '@/server/http';
import { startSession } from '@/server/session';

export const POST = handle(async (request: Request) => {
  const body = await readJson<{ email: string; password: string; remember: boolean }>(request);
  const user = await authenticate(str(body.email), typeof body.password === 'string' ? body.password : '');
  const expiresAt = await startSession(user.id, body.remember === true);
  return ok(await signedInPayload(user, expiresAt));
});
