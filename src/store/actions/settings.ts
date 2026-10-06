import { storage } from '@/lib/storage';
import { applyTheme } from '@/lib/theme';
import { DEFAULT_PREFERENCES, THEME_STORAGE_KEY } from '@/constants/defaults';
import type { ActionResult, ThemeMode, UserPreferences, WorkspaceSettings } from '@/types';
import { api } from '@/lib/api';
import { authorize, ok, setState } from '../appStore';
import { logActivity } from './activity';
import { handleUnauthorized } from './session';

export function setTheme(theme: ThemeMode): void {
  storage.writeRaw(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  setState({ theme });
}

export function updatePreferences(update: Partial<UserPreferences>): ActionResult {
  const auth = authorize();
  if (!auth.ok) return auth;
  const userId = auth.data.id;
  setState((s) => {
    const current = s.preferences[userId] ?? DEFAULT_PREFERENCES;
    return {
      preferences: {
        ...s.preferences,
        [userId]: {
          ...current,
          ...update,
          notificationCategories: { ...current.notificationCategories, ...update.notificationCategories },
        },
      },
    };
  });
  return ok();
}

export function resetPreferences(): ActionResult {
  const auth = authorize();
  if (!auth.ok) return auth;
  setState((s) => {
    const { [auth.data.id]: _removed, ...rest } = s.preferences;
    return { preferences: rest };
  });
  return ok();
}

export async function updateWorkspace(update: Partial<WorkspaceSettings>): Promise<ActionResult> {
  const auth = authorize('workspace.manage');
  if (!auth.ok) return auth;
  const result = handleUnauthorized(await api<WorkspaceSettings>('PATCH', '/api/workspace', update));
  if (!result.ok) return result;
  setState({ workspace: result.data });
  logActivity({ actor: auth.data, action: 'Updated Workspace Settings', entityType: 'settings', entityName: 'Workspace' });
  return ok();
}
