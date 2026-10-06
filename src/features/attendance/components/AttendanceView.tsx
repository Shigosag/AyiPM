'use client';

import { useState } from 'react';
import { CalendarCheck, CalendarRange, Download, ListChecks } from 'lucide-react';
import { useCurrentUser, usePermission } from '@/store';
import { Button, Card, PageHeader, SegmentedControl } from '@/components/ui';
import { useAttendanceExport } from '../hooks/useAttendanceExport';
import { useAttendanceRecords } from '../hooks/useAttendanceRecords';
import { AttendanceFilterBar } from './AttendanceFilterBar';
import { AttendanceTable } from './AttendanceTable';
import { CheckInStation } from './CheckInStation';
import { MonthlySummary } from './MonthlySummary';
import styles from './AttendanceView.module.css';

type AttendanceTab = 'daily' | 'monthly';

const TABS = [
  { value: 'daily' as const, label: 'Daily log', icon: ListChecks },
  { value: 'monthly' as const, label: 'Monthly summary', icon: CalendarRange },
];

export function AttendanceView() {
  const user = useCurrentUser();
  const canExport = usePermission('attendance.export');
  const { canViewAll, visible, filtered, filters, updateFilter, resetFilters, hasActiveFilters } = useAttendanceRecords();
  const exportCsv = useAttendanceExport();
  const [tab, setTab] = useState<AttendanceTab>('daily');

  return (
    <div className="page-container">
      <PageHeader
        icon={CalendarCheck}
        title="Attendance"
        description={
          canViewAll ? 'Daily check-ins, working hours and punctuality across the team.' : 'Your daily check-ins, working hours and punctuality.'
        }
        actions={
          canExport && (
            <Button variant="secondary" icon={Download} onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
              Export CSV
            </Button>
          )
        }
      />

      <CheckInStation />

      <Card padding="sm" className={styles.controls}>
        <SegmentedControl label="Attendance view" options={TABS} value={tab} onChange={setTab} />
        {tab === 'daily' && (
          <AttendanceFilterBar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
            showEmployeeFilter={canViewAll}
          />
        )}
      </Card>

      {tab === 'daily' ? (
        <AttendanceTable
          key={`${filters.date}|${filters.status}|${filters.employeeId}`}
          records={filtered}
          showEmployee={canViewAll}
          emptyTitle={hasActiveFilters ? 'No records match these filters' : 'No attendance records yet'}
          emptyDescription={
            hasActiveFilters ? 'Try another date or status, or reset the filters.' : 'Check in from the station above to start your attendance history.'
          }
        />
      ) : (
        <MonthlySummary records={visible} scopeToId={canViewAll ? undefined : user.id} />
      )}
    </div>
  );
}
