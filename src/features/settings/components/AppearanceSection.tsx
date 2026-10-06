'use client';

import { useCallback } from 'react';
import { setTheme, useTheme } from '@/store';
import { SegmentedControl } from '@/components/ui';
import { useToast } from '@/components/feedback/ToastProvider';
import type { ThemeMode } from '@/types';
import { SECTION_BY_ID, THEME_LABELS, THEME_OPTIONS } from '../constants';
import { SettingRow } from './SettingRow';
import { SettingsSection } from './SettingsSection';

const SECTION = SECTION_BY_ID.appearance;

export function AppearanceSection() {
  const theme = useTheme();
  const toast = useToast();

  const onChange = useCallback(
    (value: ThemeMode) => {
      if (value === theme) return;
      setTheme(value);
      toast.success(`Theme set to ${THEME_LABELS[value]}.`);
    },
    [theme, toast]
  );

  return (
    <SettingsSection id={SECTION.id} icon={SECTION.icon} title={SECTION.label} description="Choose how AyiPM looks on this device.">
      <SettingRow label="Theme" hint="Device follows your operating system's light or dark setting.">
        <SegmentedControl label="Theme" options={THEME_OPTIONS} value={theme} onChange={onChange} />
      </SettingRow>
    </SettingsSection>
  );
}
