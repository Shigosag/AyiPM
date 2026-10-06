'use client';

import { useMemo } from 'react';
import { usePreferences } from '@/store';
import { SegmentedControl, Select, type SelectOption } from '@/components/ui';
import { formatDate } from '@/lib/date';
import type { DateFormat } from '@/types';
import { DATE_FORMATS, LANGUAGE_OPTIONS, SECTION_BY_ID, TIME_FORMAT_OPTIONS, WEEK_START_OPTIONS } from '../constants';
import { useSavePreferences } from '../hooks/useSavePreferences';
import { SettingRow } from './SettingRow';
import { SettingsSection } from './SettingsSection';
import styles from './RegionalSection.module.css';

const SECTION = SECTION_BY_ID.regional;

export function RegionalSection() {
  const preferences = usePreferences();
  const save = useSavePreferences();

  const dateOptions = useMemo<SelectOption<DateFormat>[]>(() => {
    const today = new Date();
    return DATE_FORMATS.map((format) => ({ value: format, label: `${format}  (${formatDate(today, format)})` }));
  }, []);

  const languageOptions = useMemo(
    () =>
      LANGUAGE_OPTIONS.some((o) => o.value === preferences.language)
        ? LANGUAGE_OPTIONS
        : [...LANGUAGE_OPTIONS, { value: preferences.language, label: preferences.language }],
    [preferences.language]
  );

  return (
    <SettingsSection
      id={SECTION.id}
      icon={SECTION.icon}
      title={SECTION.label}
      description="How dates, times and calendars are shown to you across the app."
    >
      <SettingRow label="Language" hint="Interface language preference.">
        <Select
          className={styles.select}
          aria-label="Language"
          options={languageOptions}
          value={preferences.language}
          onChange={(language) => save({ language }, 'Language preference saved.')}
        />
      </SettingRow>
      <SettingRow label="Date format" hint="Used for dates in tables, cards and reports.">
        <Select
          className={styles.select}
          aria-label="Date format"
          options={dateOptions}
          value={preferences.dateFormat}
          onChange={(dateFormat) => save({ dateFormat }, 'Date format updated.')}
        />
      </SettingRow>
      <SettingRow label="Time format" hint="Check-in times, timestamps and the live clock.">
        <SegmentedControl
          label="Time format"
          options={TIME_FORMAT_OPTIONS}
          value={preferences.timeFormat}
          onChange={(timeFormat) => timeFormat !== preferences.timeFormat && save({ timeFormat }, 'Time format updated.')}
        />
      </SettingRow>
      <SettingRow label="Week starts on" hint="First day shown in weekly and calendar views.">
        <SegmentedControl
          label="Week starts on"
          options={WEEK_START_OPTIONS}
          value={preferences.weekStart}
          onChange={(weekStart) => weekStart !== preferences.weekStart && save({ weekStart }, 'Week start updated.')}
        />
      </SettingRow>
    </SettingsSection>
  );
}
