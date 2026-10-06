import { findPasswordReset, resetPassword } from '@/server/auth';
import { fail, handle, ok, readJson, str } from '@/server/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request: Request) => {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const reset = await findPasswordReset(token);
  if (!reset) return fail(410, 'This reset link is invalid or has expired.');
  return ok({ name: reset.user.name });
});

export const POST = handle(async (request: Request) => {
  const body = await readJson<{ token: string; password: string }>(request);
  await resetPassword(str(body.token), typeof body.password === 'string' ? body.password : '');
  return ok(null);
});
