'use client';

import { RotateCcw } from 'lucide-react';
import { resetPreferences, setTheme } from '@/store';
import { Button } from '@/components/ui';
import { useConfirm } from '@/components/feedback/ConfirmProvider';
import { useToast } from '@/components/feedback/ToastProvider';
import { SECTION_BY_ID } from '../constants';
import { SettingRow } from './SettingRow';
import { SettingsSection } from './SettingsSection';

const SECTION = SECTION_BY_ID.reset;

export function ResetPreferencesSection() {
  const confirm = useConfirm();
  const toast = useToast();

  const onReset = async () => {
    const confirmed = await confirm({
      title: 'Reset your preferences?',
      message: 'Theme, language, date and time formats, week start and notification choices will return to their defaults. Your profile and workspace settings are not affected.',
      confirmLabel: 'Reset preferences',
      tone: 'danger',
    });
    if (!confirmed) return;
    const result = resetPreferences();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setTheme('light');
    toast.success('Preferences restored to defaults.');
  };

  return (
    <SettingsSection id={SECTION.id} icon={SECTION.icon} title={SECTION.label} description="Start over with the default personal settings.">
      <SettingRow label="Restore defaults" hint="Only affects your own account on this workspace.">
        <Button variant="danger" icon={RotateCcw} onClick={onReset}>
          Reset preferences
        </Button>
      </SettingRow>
    </SettingsSection>
  );
}
