import { requestPasswordReset } from '@/server/auth';
import { handle, ok, readJson, str } from '@/server/http';

export const POST = handle(async (request: Request) => {
  const body = await readJson<{ email: string }>(request);
  await requestPasswordReset(str(body.email));
  return ok(null);
});
