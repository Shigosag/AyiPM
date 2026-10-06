import { useMemo } from 'react';
import { getResetTokenOwner, useAppStore } from '@/store';

export function useResetTokenOwnerName(token: string): string | undefined {
  const resets = useAppStore((s) => s.passwordResets);
  const employees = useAppStore((s) => s.employees);
  return useMemo(() => (token ? getResetTokenOwner(token)?.name : undefined), [token, resets, employees]);
}
