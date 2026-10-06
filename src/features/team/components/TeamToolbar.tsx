import { useMemo } from 'react';
import { ArrowUpDown, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { Button, Card, SearchInput, SegmentedControl, Select, type SelectOption } from '@/components/ui';
import { ROLE_OPTIONS } from '@/constants/roles';
import type { EmployeeStatus, Project, UserRole } from '@/types';
import { SORT_OPTIONS, type ProjectFilter, type TeamFilters, type TeamSort, type TeamViewMode } from '../utils';
import styles from './TeamToolbar.module.css';

interface TeamToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: TeamFilters;
  onFilterChange: <K extends keyof TeamFilters>(key: K, value: TeamFilters[K]) => void;
  departments: string[];
  projects: Project[];
  viewMode: TeamViewMode;
  onViewModeChange: (mode: TeamViewMode) => void;
  resultCount: number;
  total: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

const ROLE_FILTER_OPTIONS: SelectOption<'all' | UserRole>[] = [{ value: 'all', label: 'All roles' }, ...ROLE_OPTIONS];

const STATUS_FILTER_OPTIONS: SelectOption<'all' | EmployeeStatus>[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const VIEW_OPTIONS = [
  { value: 'grid' as const, label: 'Grid', icon: LayoutGrid },
  { value: 'table' as const, label: 'Table', icon: List },
];

export function TeamToolbar({
  query,
  onQueryChange,
  filters,
  onFilterChange,
  departments,
  projects,
  viewMode,
  onViewModeChange,
  resultCount,
  total,
  hasActiveFilters,
  onReset,
}: TeamToolbarProps) {
  const departmentOptions = useMemo<SelectOption[]>(
    () => [{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))],
    [departments]
  );
  const projectOptions = useMemo<SelectOption<ProjectFilter>[]>(
    () => [
      { value: 'all', label: 'All projects' },
      { value: 'unassigned', label: 'Unassigned' },
      ...projects.map((p) => ({ value: p.id, label: p.name })),
    ],
    [projects]
  );

  return (
    <Card padding="sm" className={styles.toolbar}>
      <div className={styles.row}>
        <SearchInput
          className={styles.search}
          value={query}
          onChange={onQueryChange}
          placeholder="Search name, email, Employee ID, designation, department, location…"
          aria-label="Search team members"
        />
        <SegmentedControl label="Layout" size="sm" options={VIEW_OPTIONS} value={viewMode} onChange={onViewModeChange} />
      </div>
      <div className="toolbar">
        <Select aria-label="Department" options={departmentOptions} value={filters.department} onChange={(v) => onFilterChange('department', v)} />
        <Select aria-label="Role" options={ROLE_FILTER_OPTIONS} value={filters.role} onChange={(v) => onFilterChange('role', v)} />
        <Select aria-label="Status" options={STATUS_FILTER_OPTIONS} value={filters.status} onChange={(v) => onFilterChange('status', v)} />
        <Select aria-label="Project" options={projectOptions} value={filters.project} onChange={(v) => onFilterChange('project', v)} />
        <span className={styles.sort}>
          <ArrowUpDown size={14} aria-hidden />
          <Select<TeamSort> aria-label="Sort by" options={SORT_OPTIONS} value={filters.sort} onChange={(v) => onFilterChange('sort', v)} />
        </span>
      </div>
      <div className={styles.summary}>
        <span>
          Showing <strong>{resultCount}</strong> of {total} members
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            Reset filters
          </Button>
        )}
      </div>
    </Card>
  );
}
