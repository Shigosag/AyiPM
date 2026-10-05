'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  Shield,
  Briefcase,
  User,
  Clock,
  LogOut,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Settings,
} from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import GlobalSearch from '@/components/GlobalSearch';
import {
  getLocalDateString,
  calculateElapsedSeconds,
  formatLiveTimer,
  formatWorkingHoursDisplay,
} from '@/utils/dateTime';

export default function Navbar() {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    checkIn,
    checkOut,
    attendance,
    resetAllData,
  } = useApp();

  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>('');
  const [liveElapsed, setLiveElapsed] = useState<string>('00:00:00');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const todayStr = getLocalDateString();
  const todayRecord = attendance.find(
    (a) => a.employeeId === currentUser?.id && a.date === todayStr
  );
  const isCheckedIn = Boolean(todayRecord && todayRecord.checkIn !== '—');
  const isCheckedOut = Boolean(todayRecord && todayRecord.checkOut);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTimeStr(`${datePart} • ${timePart}`);

      if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
        const secs = calculateElapsedSeconds(
          todayRecord.checkInTime || todayRecord.checkIn,
          now
        );
        setLiveElapsed(formatLiveTimer(secs));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [todayRecord]);

  const roles: { role: UserRole; label: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'admin',
      label: 'Admin',
      desc: 'Full company oversight, approvals & employee onboarding',
      icon: Shield,
      color: '#d97706',
    },
    {
      role: 'project_manager',
      label: 'Project Manager',
      desc: 'Project & task creation, sprint tracking & team reviews',
      icon: Briefcase,
      color: '#0284c7',
    },
    {
      role: 'employee',
      label: 'Employee',
      desc: 'Check-in/out, task execution & personal leave requests',
      icon: User,
      color: '#059669',
    },
  ];

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-header, rgba(255, 255, 255, 0.92))',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Left side: System clock & Current user badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            background: '#f1f5f9',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontWeight: 500,
          }}
        >
          <Clock size={14} color="var(--primary)" />
          <span>{timeStr || 'System Time'}</span>
        </div>

        {/* Quick Check-in action with Live Shift Timer */}
        {!isCheckedIn ? (
          <button
            onClick={() => checkIn()}
            className="btn btn-primary btn-sm"
            title="Log attendance check-in for today"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCircle2 size={15} />
            <span>Check In</span>
          </button>
        ) : !isCheckedOut ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.65rem',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#065f46',
                fontFamily: 'var(--font-mono, monospace)',
              }}
              title={`Shift started at ${todayRecord?.checkIn}`}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }}
              />
              <span>{liveElapsed}</span>
            </div>
            <button
              onClick={() => checkOut()}
              className="btn btn-secondary btn-sm"
              style={{
                color: '#dc2626',
                borderColor: '#fecaca',
                background: '#fef2f2',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title={`Shift started at ${todayRecord?.checkIn}. Click to record check-out.`}
            >
              <LogOut size={14} />
              <span>Check Out</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Center: Global Search with Theme Bended Edges */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 1.5rem', maxWidth: '440px' }}>
        <GlobalSearch />
      </div>

      {/* Right side: Role Switcher & Persona Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Reset Demo Data button */}
        <button
          onClick={() => {
            if (confirm('Reset demo state to initial seed data?')) {
              resetAllData();
            }
          }}
          className="btn-icon btn-ghost"
          title="Reset to initial seed data"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RotateCcw size={16} />
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '0.5rem',
          }}
        >
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
