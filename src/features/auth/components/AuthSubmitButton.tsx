import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './AuthSubmitButton.module.css';

interface AuthSubmitButtonProps {
  loading: boolean;
  loadingLabel: ReactNode;
  children: ReactNode;
}

export function AuthSubmitButton({ loading, loadingLabel, children }: AuthSubmitButtonProps) {
  return (
    <Button type="submit" fullWidth loading={loading} className={styles.submit}>
      {loading ? loadingLabel : children}
      {!loading && <ArrowRight size={16} />}
    </Button>
  );
}
