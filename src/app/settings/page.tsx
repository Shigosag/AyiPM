'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  Settings,
  User,
  Bell,
  Building2,
  ShieldCheck,
  Save,
} from 'lucide-react';

type SectionKey = 'profile' | 'notifications' | 'workspace' | 'security';

const sections: {
  key: SectionKey;
  label: string;
  desc: string;
  icon: any;
  roles: UserRole[];
}[] = [
  {
    key: 'profile',
    label: 'Profile',
    desc: 'Personal details shown across the workspace.',
    icon: User,
    roles: ['admin', 'project_manager', 'employee'],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    desc: 'Choose which updates you want to hear about.',
    icon: Bell,
    roles: ['admin', 'project_manager', 'employee'],
  },
  {
    key: 'workspace',
    label: 'Workspace',
    desc: 'Company-wide defaults for attendance and leave.',
    icon: Building2,
    roles: ['admin'],
  },
  {
    key: 'security',
    label: 'Security',
    desc: 'Password and session management.',
    icon: ShieldCheck,
    roles: ['admin', 'project_manager', 'employee'],
  },
];

export default function SettingsPage() {
  const { currentUser, currentRole } = useApp();
  const [activeSection, setActiveSection] = useState<SectionKey>('profile');

  const visibleSections = sections.filter((s) => s.roles.includes(currentRole));
  const current =
    visibleSections.find((s) => s.key === activeSection) || visibleSections[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: persist settings once a settings store exists in AppContext
    alert(`${current.label} settings saved (scaffold — not persisted yet).`);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <h1 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Settings size={28} color="var(--primary)" />
          <span>Settings</span>
        </h1>
        <p className="subtext" style={{ marginTop: '0.25rem' }}>
          Manage your profile, notification preferences, and workspace configuration.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 240px) 1fr',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Section Navigation */}
        <nav
          className="glass-card"
          style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          {visibleSections.map((s) => {
            const Icon = s.icon;
            const isActive = current.key === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? '#f0f9ff' : 'transparent',
                  border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                  color: isActive ? '#0284c7' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={16} color={isActive ? '#0284c7' : '#64748b'} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Section Content */}
        <form
          onSubmit={handleSave}
          className="glass-card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h2 className="heading-md">{current.label}</h2>
            <p className="subtext" style={{ marginTop: '0.25rem' }}>
              {current.desc}
            </p>
          </div>

          {current.key === 'profile' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="avatar"
                  style={{ width: '56px', height: '56px' }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{currentUser.name}</div>
                  <div className="subtext">
                    {currentUser.designation} · {currentUser.department}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" defaultValue={currentUser.name} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" defaultValue={currentUser.email} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" defaultValue={currentUser.phone} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" defaultValue={currentUser.location} />
                </div>
              </div>
            </>
          )}

          {current.key === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'leave', label: 'Leave request updates', defaultOn: true },
                { id: 'tasks', label: 'Task assignments and status changes', defaultOn: true },
                { id: 'projects', label: 'Project milestone reminders', defaultOn: false },
                { id: 'digest', label: 'Weekly activity digest email', defaultOn: false },
              ].map((n) => (
                <label
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <span>{n.label}</span>
                  <input type="checkbox" defaultChecked={n.defaultOn} />
                </label>
              ))}
            </div>
          )}

          {current.key === 'workspace' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" defaultValue="Ayitrix" />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-select" defaultValue="Asia/Colombo">
                  <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Work Day Starts</label>
                <input type="time" className="form-input" defaultValue="09:00" />
              </div>
              <div className="form-group">
                <label className="form-label">Late Check-in Grace (minutes)</label>
                <input type="number" min="0" className="form-input" defaultValue={15} />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Leave Days</label>
                <input type="number" min="0" className="form-input" defaultValue={20} />
              </div>
              <div className="form-group">
                <label className="form-label">Sick Leave Days</label>
                <input type="number" min="0" className="form-input" defaultValue={10} />
              </div>
            </div>
          )}

          {current.key === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '420px' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" />
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
