'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Authentication routes render without the dashboard Sidebar and Navbar
  const isAuthRoute = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].some((route) => pathname === route || pathname?.startsWith(`${route}/`));

  if (isAuthRoute) {
    return <main className="auth-container-root">{children}</main>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
