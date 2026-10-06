import { useMemo } from 'react';
import { getInvite, useAppStore } from '@/store';

export function useInvite(token: string) {
  const invites = useAppStore((s) => s.invites);
  const employees = useAppStore((s) => s.employees);
  const credentials = useAppStore((s) => s.credentials);
  return useMemo(() => (token ? getInvite(token) : undefined), [token, invites, employees, credentials]);
}
