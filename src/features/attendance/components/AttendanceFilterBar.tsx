import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { useEmployees } from '@/store';
import { Button, Input, Select, type SelectOption } from '@/components/ui';
import { STATUS_FILTER_OPTIONS, type AttendanceFilters, type StatusFilter } from '../utils';
import styles from './AttendanceFilterBar.module.css';

interface AttendanceFilterBarProps {
  filters: AttendanceFilters;
  onChange: <K extends keyof AttendanceFilters>(key: K, value: AttendanceFilters[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  showEmployeeFilter: boolean;
}

export function AttendanceFilterBar({ filters, onChange, onReset, hasActiveFilters, showEmployeeFilter }: AttendanceFilterBarProps) {
  const employees = useEmployees();
  const employeeOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'all', label: 'All employees' },
      ...[...employees].sort((a, b) => a.name.localeCompare(b.name)).map((e) => ({ value: e.id, label: e.name })),
    ],
    [employees]
  );

  return (
    <div className="toolbar">
      <Input type="date" aria-label="Filter by date" className={styles.date} value={filters.date} onChange={(e) => onChange('date', e.target.value)} />
      <Select<StatusFilter> aria-label="Filter by status" options={STATUS_FILTER_OPTIONS} value={filters.status} onChange={(v) => onChange('status', v)} />
      {showEmployeeFilter && (
        <Select aria-label="Filter by employee" options={employeeOptions} value={filters.employeeId} onChange={(v) => onChange('employeeId', v)} />
      )}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
