import { acceptInvite, findInvite } from '@/server/auth';
import { signedInPayload } from '@/server/bootstrap';
import { fail, handle, ok, readJson, str } from '@/server/http';
import { startSession } from '@/server/session';
import { getWorkspaceSettings } from '@/server/workspace';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request: Request) => {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const invite = await findInvite(token);
  if (!invite) return fail(410, 'This invitation is invalid or has expired.');
  const workspace = await getWorkspaceSettings();
  return ok({
    name: invite.user.name,
    email: invite.user.email,
    employeeId: invite.user.employeeId,
    companyName: workspace?.companyName ?? 'AyiPM',
    expiresAt: invite.expiresAt.toISOString(),
  });
});

export const POST = handle(async (request: Request) => {
  const body = await readJson<{ token: string; password: string }>(request);
  const user = await acceptInvite(str(body.token), typeof body.password === 'string' ? body.password : '');
  const expiresAt = await startSession(user.id, false);
  return ok(await signedInPayload(user, expiresAt));
});
