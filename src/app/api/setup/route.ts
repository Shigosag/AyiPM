import { setupWorkspace } from '@/server/auth';
import { signedInPayload } from '@/server/bootstrap';
import { handle, ok, readJson, str } from '@/server/http';
import { startSession } from '@/server/session';
import { needsSetup } from '@/server/workspace';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => ok({ needsSetup: await needsSetup() }));

export const POST = handle(async (request: Request) => {
  const body = await readJson<{ companyName: string; name: string; email: string; password: string }>(request);
  const user = await setupWorkspace({
    companyName: str(body.companyName),
    name: str(body.name),
    email: str(body.email),
    password: typeof body.password === 'string' ? body.password : '',
  });
  const expiresAt = await startSession(user.id, false);
  return ok(await signedInPayload(user, expiresAt), { status: 201 });
});
