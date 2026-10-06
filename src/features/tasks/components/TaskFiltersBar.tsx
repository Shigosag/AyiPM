'use client';

import { useMemo } from 'react';
import { ArrowUpDown, UserCheck, X } from 'lucide-react';
import { Button, SearchInput, Select, type SelectOption } from '@/components/ui';
import { useEmployees, useProjects } from '@/store';
import { TASK_PRIORITY, TASK_PRIORITY_ORDER, TASK_STATUS, TASK_STATUS_ORDER } from '@/constants/status';
import { pluralize } from '@/lib/format';
import type { TaskPriority, TaskStatus } from '@/types';
import type { TaskFiltersApi } from '../hooks/useTaskFilters';
import { SORT_OPTIONS, UNASSIGNED, type TaskSort, type TaskView } from '../utils';
import styles from './TaskFiltersBar.module.css';

const PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = TASK_PRIORITY_ORDER.map((p) => ({ value: p, label: TASK_PRIORITY[p].label }));
const STATUS_OPTIONS: SelectOption<TaskStatus>[] = TASK_STATUS_ORDER.map((s) => ({ value: s, label: TASK_STATUS[s].label }));

interface TaskFiltersBarProps {
  api: TaskFiltersApi;
  view: TaskView;
}

export function TaskFiltersBar({ api, view }: TaskFiltersBarProps) {
  const { filters, setFilter, reset, isFiltered, filteredTasks, totalCount } = api;
  const projects = useProjects();
  const employees = useEmployees();

  const projectOptions = useMemo<SelectOption[]>(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)).map((p) => ({ value: p.id, label: p.name })),
    [projects]
  );
  const assigneeOptions = useMemo<SelectOption[]>(
    () => [
      { value: UNASSIGNED, label: 'Unassigned' },
      ...[...employees].sort((a, b) => a.name.localeCompare(b.name)).map((e) => ({ value: e.id, label: e.name })),
    ],
    [employees]
  );

  return (
    <div className={`card ${styles.bar}`}>
      <div className={styles.row}>
        <SearchInput
          className={styles.search}
          value={filters.query}
          onChange={(v) => setFilter('query', v)}
          placeholder="Search title, description or project…"
          aria-label="Search tasks"
        />
        <Button
          variant={filters.mine ? 'primary' : 'outline'}
          size="sm"
          icon={UserCheck}
          aria-pressed={filters.mine}
          onClick={() => setFilter('mine', !filters.mine)}
        >
          My tasks
        </Button>
        {view === 'list' && (
          <label className={styles.sort}>
            <ArrowUpDown size={14} aria-hidden />
            <span className="sr-only">Sort by</span>
            <Select<TaskSort> options={SORT_OPTIONS} value={filters.sort} onChange={(v) => setFilter('sort', v)} />
          </label>
        )}
      </div>
      <div className={styles.row}>
        <Select
          aria-label="Project"
          className={styles.select}
          options={projectOptions}
          placeholder="All projects"
          value={filters.projectId}
          onChange={(v) => setFilter('projectId', v)}
        />
        <Select
          aria-label="Assignee"
          className={styles.select}
          options={assigneeOptions}
          placeholder="All assignees"
          value={filters.assigneeId}
          onChange={(v) => setFilter('assigneeId', v)}
        />
        <Select<TaskPriority | ''>
          aria-label="Priority"
          className={styles.select}
          options={PRIORITY_OPTIONS}
          placeholder="All priorities"
          value={filters.priority}
          onChange={(v) => setFilter('priority', v)}
        />
        <Select<TaskStatus | ''>
          aria-label="Status"
          className={styles.select}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          value={filters.status}
          onChange={(v) => setFilter('status', v)}
        />
        <span className={styles.summary} aria-live="polite">
          {isFiltered ? `${filteredTasks.length} of ${pluralize(totalCount, 'task')}` : pluralize(totalCount, 'task')}
        </span>
        {isFiltered && (
          <Button variant="ghost" size="sm" icon={X} onClick={reset}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
