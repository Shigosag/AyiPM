import { storage } from '@/lib/storage';
import { applyTheme } from '@/lib/theme';
import { DEFAULT_PREFERENCES, THEME_STORAGE_KEY } from '@/constants/defaults';
import type { ActionResult, ThemeMode, UserPreferences, WorkspaceSettings } from '@/types';
import { authorize, fail, ok, setState } from '../appStore';
import { logActivity } from './activity';

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

export function updateWorkspace(update: Partial<WorkspaceSettings>): ActionResult {
  const auth = authorize('workspace.manage');
  if (!auth.ok) return auth;
  if (update.companyName !== undefined && !update.companyName.trim()) return fail('Company name is required.');
  if (update.gracePeriodMinutes !== undefined && (update.gracePeriodMinutes < 0 || update.gracePeriodMinutes > 180)) {
    return fail('Grace period must be between 0 and 180 minutes.');
  }
  if (update.employeeIdPrefix !== undefined && !/^[A-Za-z]{1,5}$/.test(update.employeeIdPrefix)) {
    return fail('Employee ID prefix must be 1–5 letters.');
  }
  setState((s) => ({
    workspace: {
      ...s.workspace,
      ...update,
      employeeIdPrefix: (update.employeeIdPrefix ?? s.workspace.employeeIdPrefix).toUpperCase(),
      leaveAllowance: { ...s.workspace.leaveAllowance, ...update.leaveAllowance },
    },
  }));
  logActivity({ actor: auth.data, action: 'Updated Workspace Settings', entityType: 'settings', entityName: 'Workspace' });
  return ok();
}
