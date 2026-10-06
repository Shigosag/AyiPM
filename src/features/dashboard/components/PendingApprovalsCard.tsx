import Link from 'next/link';
import { PlaneTakeoff } from 'lucide-react';
import { Avatar, Card, CardHeader, EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants/navigation';
import { pluralize } from '@/lib/format';
import { useEmployeesById, useFormatters } from '@/store';
import { usePendingApprovals } from '../hooks/usePendingApprovals';
import { CardLink } from './CardLink';
import styles from './PendingApprovalsCard.module.css';

const LIMIT = 5;

export function PendingApprovalsCard() {
  const pending = usePendingApprovals();
  const employeesById = useEmployeesById();
  const { date } = useFormatters();

  return (
    <Card as="section">
      <CardHeader
        icon={PlaneTakeoff}
        title="Pending approvals"
        description={pending.length > 0 ? `${pluralize(pending.length, 'leave request')} awaiting review` : 'Leave requests awaiting review'}
        actions={<CardLink href={ROUTES.leave}>Review</CardLink>}
      />
      {pending.length === 0 ? (
        <EmptyState compact icon={PlaneTakeoff} title="All clear" description="There are no leave requests waiting for your review." />
      ) : (
        <ul className={styles.list}>
          {pending.slice(0, LIMIT).map((r) => {
            const employee = employeesById.get(r.employeeId);
            const name = employee?.name ?? 'Former member';
            return (
              <li key={r.id}>
                <Link href={ROUTES.leave} className={styles.row}>
                  <Avatar name={name} src={employee?.avatar} size={30} />
                  <span className={styles.text}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.meta}>
                      {r.leaveType} · {pluralize(r.days, 'day')} · {date(r.startDate)}
                      {r.endDate !== r.startDate && ` – ${date(r.endDate)}`}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {pending.length > LIMIT && <p className={styles.more}>+{pending.length - LIMIT} more pending</p>}
    </Card>
  );
}
