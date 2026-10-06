import { useMemo } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { IconButton, SearchInput, SegmentedControl, Select, type SegmentOption } from '@/components/ui';
import { PROJECT_STATUS } from '@/constants/status';
import type { ProjectStatus } from '@/types';
import {
  PROJECT_SORT_OPTIONS,
  PROJECT_STATUS_KEYS,
  type ProjectSortKey,
  type ProjectStatusFilter,
  type ProjectViewMode,
} from '../utils';
import styles from './ProjectsToolbar.module.css';

interface ProjectsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: ProjectStatusFilter;
  onStatusChange: (value: ProjectStatusFilter) => void;
  counts: Record<ProjectStatus, number>;
  total: number;
  sort: ProjectSortKey;
  onSortChange: (value: ProjectSortKey) => void;
  view: ProjectViewMode;
  onViewChange: (value: ProjectViewMode) => void;
}

export function ProjectsToolbar(props: ProjectsToolbarProps) {
  const { query, onQueryChange, status, onStatusChange, counts, total, sort, onSortChange, view, onViewChange } = props;

  const statusOptions = useMemo<SegmentOption<ProjectStatusFilter>[]>(
    () => [
      { value: 'all', label: 'All', count: total },
      ...PROJECT_STATUS_KEYS.map((key) => ({ value: key, label: PROJECT_STATUS[key].label, count: counts[key] })),
    ],
    [counts, total]
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <SearchInput
          className={styles.search}
          value={query}
          onChange={onQueryChange}
          placeholder="Search by name, client or description…"
          aria-label="Search projects"
        />
        <div className={styles.controls}>
          <Select aria-label="Sort projects" className={styles.sort} options={PROJECT_SORT_OPTIONS} value={sort} onChange={onSortChange} />
          <div className={styles.viewToggle} role="group" aria-label="View mode">
            <IconButton icon={LayoutGrid} label="Card view" active={view === 'grid'} onClick={() => onViewChange('grid')} aria-pressed={view === 'grid'} />
            <IconButton icon={List} label="Table view" active={view === 'table'} onClick={() => onViewChange('table')} aria-pressed={view === 'table'} />
          </div>
        </div>
      </div>
      <SegmentedControl label="Filter by status" options={statusOptions} value={status} onChange={onStatusChange} size="sm" />
    </div>
  );
}
