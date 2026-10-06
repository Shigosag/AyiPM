import { changePassword } from '@/server/auth';
import { handle, ok, readJson } from '@/server/http';
import { requireUser } from '@/server/session';

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const body = await readJson<{ currentPassword: string; newPassword: string }>(request);
  await changePassword(
    user,
    typeof body.currentPassword === 'string' ? body.currentPassword : '',
    typeof body.newPassword === 'string' ? body.newPassword : ''
  );
  return ok(null);
});
