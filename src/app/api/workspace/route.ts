import type { WorkspaceSettings } from '@/types';
import { HttpError, handle, ok, readJson } from '@/server/http';
import { requireUser } from '@/server/session';
import { getWorkspaceSettings, updateWorkspaceSettings } from '@/server/workspace';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await requireUser();
  const workspace = await getWorkspaceSettings();
  if (!workspace) throw new HttpError(404, 'Workspace has not been set up.');
  return ok(workspace);
});

export const PATCH = handle(async (request: Request) => {
  await requireUser('workspace.manage');
  const body = await readJson<WorkspaceSettings>(request);
  return ok(await updateWorkspaceSettings(body));
});
