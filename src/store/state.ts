import type {
  ActivityLogItem,
  AttendanceRecord,
  Credential,
  PasswordResetToken,
  InviteToken,
  LoginAttempt,
  Employee,
  LeaveRequest,
  NotificationItem,
  Project,
  Session,
  Task,
  ThemeMode,
  UserPreferences,
  WorkspaceSettings,
} from '@/types';
import { DEFAULT_WORKSPACE } from '@/constants/defaults';

export interface PersistedState {
  session: Session | null;
  employees: Employee[];
  credentials: Record<string, Credential>;
  passwordResets: PasswordResetToken[];
  invites: InviteToken[];
  loginAttempts: Record<string, LoginAttempt>;
  projects: Project[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  activityLog: ActivityLogItem[];
  notifications: NotificationItem[];
  preferences: Record<string, UserPreferences>;
  workspace: WorkspaceSettings;
}

export interface AppState extends PersistedState {
  hydrated: boolean;
  theme: ThemeMode;
}

export const PERSISTED_KEYS: (keyof PersistedState)[] = [
  'session',
  'employees',
  'credentials',
  'passwordResets',
  'invites',
  'loginAttempts',
  'projects',
  'tasks',
  'attendance',
  'leaveRequests',
  'activityLog',
  'notifications',
  'preferences',
  'workspace',
];

export function createInitialState(): AppState {
  return {
    hydrated: false,
    theme: 'light',
    session: null,
    employees: [],
    credentials: {},
    passwordResets: [],
    invites: [],
    loginAttempts: {},
    projects: [],
    tasks: [],
    attendance: [],
    leaveRequests: [],
    activityLog: [],
    notifications: [],
    preferences: {},
    workspace: DEFAULT_WORKSPACE,
  };
}
