import { useCallback, useRef } from 'react';
import { shallowEqual, useStoreSelector, type EqualityFn } from '@/lib/store';
import { formatDate, formatDateTime, formatTime } from '@/lib/date';
import { hasPermission, type Permission } from '@/constants/roles';
import type { Employee } from '@/types';
import { appStore } from './appStore';
import {
  selectCurrentUser,
  selectEmployeesById,
  selectMyNotifications,
  selectMyPreferences,
  selectNavCounts,
  selectProjectProgress,
  selectProjectsById,
  selectUnreadCount,
} from './selectors';
import type { AppState } from './state';

export function useAppStore<S>(selector: (state: AppState) => S, isEqual?: EqualityFn<S>): S {
  return useStoreSelector(appStore, selector, isEqual);
}

export function useShallowStore<S>(selector: (state: AppState) => S): S {
  return useStoreSelector(appStore, selector, shallowEqual);
}

export const useHydrated = () => useAppStore((s) => s.hydrated);

export const useSessionUser = () => useAppStore(selectCurrentUser);

// Only use inside the authenticated app shell, which guarantees a signed-in user.
export function useCurrentUser(): Employee {
  const user = useAppStore(selectCurrentUser);
  const lastUser = useRef(user);
  if (user) lastUser.current = user;
  if (!lastUser.current) throw new Error('useCurrentUser must be used inside the authenticated app shell.');
  return lastUser.current;
}

export function usePermission(permission: Permission): boolean {
  return useAppStore((s) => hasPermission(selectCurrentUser(s)?.role, permission));
}

export const useEmployees = () => useAppStore((s) => s.employees);
export const useProjects = () => useAppStore((s) => s.projects);
export const useTasks = () => useAppStore((s) => s.tasks);
export const useAttendance = () => useAppStore((s) => s.attendance);
export const useLeaveRequests = () => useAppStore((s) => s.leaveRequests);
export const useActivityLog = () => useAppStore((s) => s.activityLog);
export const useWorkspace = () => useAppStore((s) => s.workspace);
export const useTheme = () => useAppStore((s) => s.theme);

export const useEmployeesById = () => useAppStore((s) => selectEmployeesById(s.employees));
export const useProjectsById = () => useAppStore((s) => selectProjectsById(s.projects));
export const useProjectProgress = () => useAppStore((s) => selectProjectProgress(s.projects, s.tasks));

export function useEmployee(id: string | undefined): Employee | undefined {
  return useAppStore((s) => (id ? selectEmployeesById(s.employees).get(id) : undefined));
}

export const useIsPendingInvite = (employeeId: string) =>
  useAppStore((s) => selectEmployeesById(s.employees).get(employeeId)?.invited ?? false);

export const useNeedsSetup = () => useAppStore((s) => s.needsSetup);

export const useMyNotifications = () => useAppStore(selectMyNotifications);
export const useUnreadCount = () => useAppStore(selectUnreadCount);
export const useNavCounts = () => useShallowStore(selectNavCounts);
export const usePreferences = () => useAppStore(selectMyPreferences);

export function useFormatters() {
  const { dateFormat, timeFormat } = usePreferences();
  return {
    date: useCallback((value?: string | Date) => formatDate(value, dateFormat), [dateFormat]),
    time: useCallback((value?: string | Date, withSeconds = false) => formatTime(value, timeFormat, withSeconds), [timeFormat]),
    dateTime: useCallback((value?: string) => formatDateTime(value, dateFormat, timeFormat), [dateFormat, timeFormat]),
  };
}
