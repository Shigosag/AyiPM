'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavCounts } from '@/store';
import { ACCOUNT_NAV_ITEMS, NAV_ITEMS, type NavItem } from '@/constants/navigation';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/cn';
import type { NavCounts } from '@/store/selectors';
import { BrandLogo } from './BrandLogo';
import styles from './Sidebar.module.css';

const COLLAPSE_KEY = 'ayipm:v2:sidebar-collapsed';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NavLink = memo(function NavLink({
  item,
  active,
  collapsed,
  badge,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  badge?: number | string;
}) {
  const Icon = item.icon;
  const showBadge = badge !== undefined && badge !== 0 && !collapsed;
  return (
    <Link
      href={item.href}
      className={cn(styles.link, active && styles.active)}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
    >
      <span className={styles.linkMain}>
        <Icon size={18} />
        {!collapsed && <span>{item.label}</span>}
      </span>
      {showBadge && <span className={cn('badge', item.badgeTone ? `badge-${item.badgeTone}` : 'badge-neutral', styles.badge)}>{badge}</span>}
    </Link>
  );
});

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname() ?? '';
  const counts = useNavCounts();
  const [collapsedPref, setCollapsed] = useState(false);
  const collapsed = collapsedPref && !mobileOpen;

  useEffect(() => {
    setCollapsed(storage.readRaw(COLLAPSE_KEY) === '1');
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsedPref;
    storage.writeRaw(COLLAPSE_KEY, next ? '1' : '0');
    setCollapsed(next);
  };

  const badgeFor = (item: NavItem) => (item.badge ? counts[item.badge as keyof NavCounts] : undefined);

  return (
    <>
      <div className={cn(styles.scrim, mobileOpen && styles.scrimVisible)} onClick={onMobileClose} aria-hidden />
      <aside className={cn(styles.sidebar, collapsed && styles.collapsed, mobileOpen && styles.mobileOpen)} aria-label="Main navigation">
        <div className={styles.brand}>
          <BrandLogo size="md" showWordmark={!collapsed} />
          <button type="button" className={cn('icon-btn', styles.mobileClose)} onClick={onMobileClose} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.sectionHead}>
            {!collapsed && <span className={styles.sectionLabel}>Workspace</span>}
            <button
              type="button"
              className={cn('icon-btn', styles.collapseBtn)}
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} badge={badgeFor(item)} />
          ))}

          <div className={styles.sectionHead}>{!collapsed && <span className={styles.sectionLabel}>Account</span>}</div>
          {ACCOUNT_NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
          ))}
        </nav>
      </aside>
    </>
  );
}
