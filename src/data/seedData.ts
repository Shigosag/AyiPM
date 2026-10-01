import { Employee, Project, Task, AttendanceRecord, LeaveRequest, LeaveBalance, ActivityLogItem, NotificationItem } from '@/types';

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@ayipm.io',
    department: 'Engineering',
    designation: 'Tech Lead / Architect',
    role: 'admin',
    status: 'active',
    joinDate: '2023-01-15',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
  },
  {
    id: 'emp-2',
    name: 'Marcus Vance',
    email: 'marcus.v@ayipm.io',
    department: 'Engineering',
    designation: 'Senior Backend Engineer & PM',
    role: 'project_manager',
    status: 'active',
    joinDate: '2023-03-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 876-5432',
    location: 'New York, NY',
  },
  {
    id: 'emp-3',
    name: 'Elena Rostova',
    email: 'elena.r@ayipm.io',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    role: 'employee',
    status: 'active',
    joinDate: '2023-06-20',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
  },
  {
    id: 'emp-4',
    name: 'David Kim',
    email: 'david.kim@ayipm.io',
    department: 'Engineering',
    designation: 'Frontend & QA Lead',
    role: 'employee',
    status: 'active',
    joinDate: '2023-08-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 987-6543',
    location: 'Seattle, WA',
  },
  {
    id: 'emp-5',
    name: 'Amina Nour',
    email: 'amina.n@ayipm.io',
    department: 'Product',
    designation: 'Product Designer',
    role: 'employee',
    status: 'active',
    joinDate: '2023-11-05',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
  },
  {
    id: 'emp-6',
    name: 'Liam Gallagher',
    email: 'liam.g@ayipm.io',
    department: 'Operations',
    designation: 'HR & People Ops Lead',
    role: 'admin',
    status: 'active',
    joinDate: '2022-09-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 654-3210',
    location: 'Denver, CO',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'AyiPM Core Platform',
    client: 'Internal Product Team',
    description: '12-week MVP development of employee and project management suite.',
    startDate: '2026-09-01',
    endDate: '2026-11-24',
    status: 'in_progress',
    progress: 68,
    members: ['emp-1', 'emp-2', 'emp-3', 'emp-4'],
    budget: '$85,000',
  },
  {
    id: 'proj-2',
    name: 'Fintech Payment Engine',
    client: 'Apex Global Financial',
    description: 'High-throughput microservices architecture for multi-currency processing.',
    startDate: '2026-08-15',
    endDate: '2026-12-30',
    status: 'in_progress',
    progress: 45,
    members: ['emp-1', 'emp-2', 'emp-5'],
    budget: '$140,000',
  },
  {
    id: 'proj-3',
    name: 'Enterprise CRM Migration',
    client: 'Vanguard Logistics',
    description: 'Migrating legacy ERP spreadsheets to modern relational cloud tables.',
    startDate: '2026-07-01',
    endDate: '2026-10-15',
    status: 'in_review',
    progress: 92,
    members: ['emp-2', 'emp-4'],
    budget: '$62,000',
  },
  {
    id: 'proj-4',
    name: 'Design System & Mobile UI',
    client: 'Internal R&D',
    description: 'Unified cross-platform component tokens, Figma sync, and responsive styles.',
    startDate: '2026-09-10',
    endDate: '2026-11-30',
    status: 'planning',
    progress: 25,
    members: ['emp-3', 'emp-5'],
    budget: '$35,000',
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    projectName: 'AyiPM Core Platform',
    title: 'Design 12-table relational schema & versioned migrations',
    description: 'Define relational schema covering users, roles, attendance, tasks, and activity logs.',
    assigneeId: 'emp-1',
    assigneeName: 'Sarah Chen',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    priority: 'urgent',
    status: 'done',
    dueDate: '2026-09-08',
    comments: [
      {
        id: 'c-1',
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Foreign keys and soft-delete conventions reviewed and approved.',
        timestamp: '2026-09-07 16:30',
      }
    ],
    history: [
      { id: 'h-1', action: 'Created task', author: 'Sarah Chen', timestamp: '2026-09-02 09:00' },
      { id: 'h-2', action: 'Moved to Done', author: 'Sarah Chen', timestamp: '2026-09-08 17:15' }
    ]
  },
];

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    date: '2026-09-21',
    checkIn: '08:55',
    checkOut: undefined,
    workingHours: 5.8,
    status: 'present',
    notes: 'In office — Sprint architecture review',
  },
  // Yesterday records
  {
    id: 'att-7',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    date: '2026-09-20',
    checkIn: '08:50',
    checkOut: '17:35',
    workingHours: 8.7,
    status: 'present',
  },
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-5',
    employeeName: 'Amina Nour',
    leaveType: 'Sick',
    startDate: '2026-09-21',
    endDate: '2026-09-22',
    days: 2,
    reason: 'Dental surgery and recovery rest.',
    status: 'approved',
    appliedOn: '2026-09-18',
    approvedBy: 'Sarah Chen (Admin)',
  },
];

export const initialLeaveBalances: Record<string, LeaveBalance> = {
  'emp-1': { employeeId: 'emp-1', annualTotal: 20, annualUsed: 4, sickTotal: 10, sickUsed: 1, casualTotal: 7, casualUsed: 2 },
  'emp-2': { employeeId: 'emp-2', annualTotal: 20, annualUsed: 6, sickTotal: 10, sickUsed: 0, casualTotal: 7, casualUsed: 2 },
  'emp-3': { employeeId: 'emp-3', annualTotal: 20, annualUsed: 3, sickTotal: 10, sickUsed: 2, casualTotal: 7, casualUsed: 1 },
  'emp-4': { employeeId: 'emp-4', annualTotal: 20, annualUsed: 5, sickTotal: 10, sickUsed: 0, casualTotal: 7, casualUsed: 0 },
  'emp-5': { employeeId: 'emp-5', annualTotal: 20, annualUsed: 2, sickTotal: 10, sickUsed: 2, casualTotal: 7, casualUsed: 1 },
  'emp-6': { employeeId: 'emp-6', annualTotal: 20, annualUsed: 8, sickTotal: 10, sickUsed: 1, casualTotal: 7, casualUsed: 3 },
};

export const initialActivityLog: ActivityLogItem[] = [
  {
    id: 'act-1',
    actorName: 'Sarah Chen',
    actorRole: 'admin',
    action: 'Approved Leave Request',
    entityType: 'leave',
    entityName: 'Amina Nour (2 days Sick Leave)',
    timestamp: '2026-09-18 16:45',
    details: 'Status updated to Approved; Attendance marked as Leave.',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Task Review Requested',
    message: 'Sarah Chen completed "Design 12-table relational schema & versioned migrations" and requested review.',
    category: 'task',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    read: false,
    link: '/tasks',
    priority: 'urgent',
    sender: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'notif-2',
    title: 'New Leave Application',
    message: 'Amina Nour applied for 2 days Sick Leave (Sep 21 - Sep 22) awaiting review.',
    category: 'leave',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    read: false,
    link: '/leave',
    priority: 'high',
    sender: {
      name: 'Amina Nour',
    },
  },
  {
    id: 'notif-3',
    title: 'Late Attendance Recorded',
    message: 'Sarah Chen checked in at 09:24 AM, outside the standard grace period window.',
    category: 'attendance',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    read: false,
    link: '/attendance',
    priority: 'normal',
  },
  {
    id: 'notif-4',
    title: 'Sprint Milestone Achieved',
    message: 'Project "AyiPM Core Platform" reached 68% completion milestone.',
    category: 'system',
    timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
    read: true,
    link: '/projects',
    priority: 'normal',
  },
  {
    id: 'notif-5',
    title: 'System Preferences Synchronized',
    message: 'Leave balance defaults and attendance policies were updated in Settings.',
    category: 'system',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    read: true,
    link: '/settings',
    priority: 'low',
  },
];

