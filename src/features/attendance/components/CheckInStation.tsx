'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, LogOut, PlaneTakeoff } from 'lucide-react';
import { checkIn, checkOut, useCurrentUser, useFormatters, useWorkspace } from '@/store';
import { Badge, Button, Card, Input, StatusBadge } from '@/components/ui';
import { useToast } from '@/components/feedback/ToastProvider';
import { formatDateLong, formatHours, graceDeadlineLabel } from '@/lib/date';
import { useTodayRecord } from '../hooks/useTodayRecord';
import { ShiftTimer } from './ShiftTimer';
import styles from './CheckInStation.module.css';

export function CheckInStation() {
  const user = useCurrentUser();
  const workspace = useWorkspace();
  const record = useTodayRecord(user.id);
  const { time } = useFormatters();
  const toast = useToast();
  const [notes, setNotes] = useState('');

  const onLeave = record?.status === 'leave';
  const checkedIn = !!record?.checkInAt && !record.checkOutAt;
  const completed = !!record?.checkOutAt;
  const canCheckIn = !onLeave && !record?.checkInAt;

  const handleCheckIn = () => {
    const result = checkIn(notes);
    if (!result.ok) return toast.error(result.error);
    setNotes('');
    toast.success(result.data.status === 'late' ? `Checked in at ${time(result.data.checkInAt)} (after the grace period).` : 'Checked in on time.');
  };

  const handleCheckOut = () => {
    const result = checkOut();
    if (!result.ok) return toast.error(result.error);
    toast.success(`Checked out. ${formatHours(result.data.workingHours)} logged today.`);
  };

  return (
    <Card className={styles.station}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>Today · {formatDateLong(new Date())}</span>
        <h2 className="heading-lg">{user.name}</h2>
        <p className={styles.rule}>
          <Clock size={14} />
          Workday starts {workspace.workDayStart} · late after {graceDeadlineLabel(workspace.workDayStart, workspace.gracePeriodMinutes)} · under{' '}
          {workspace.halfDayThresholdHours}h counts as a half day
        </p>
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Status</dt>
          <dd>{record ? <StatusBadge kind="attendance" value={record.status} /> : <Badge>Not checked in</Badge>}</dd>
        </div>
        <div>
          <dt>Check in</dt>
          <dd className={styles.mono}>{time(record?.checkInAt)}</dd>
        </div>
        <div>
          <dt>Check out</dt>
          <dd className={styles.mono}>{checkedIn ? 'In progress' : time(record?.checkOutAt)}</dd>
        </div>
        <div>
          <dt>{completed ? 'Hours logged' : 'Shift duration'}</dt>
          <dd>{checkedIn && record?.checkInAt ? <ShiftTimer since={record.checkInAt} /> : <strong>{formatHours(record?.workingHours)}</strong>}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        {onLeave && (
          <p className={styles.done}>
            <PlaneTakeoff size={16} /> You are on approved leave today.
          </p>
        )}
        {completed && (
          <p className={styles.done}>
            <CheckCircle2 size={16} /> Shift completed · {formatHours(record?.workingHours)}
          </p>
        )}
        {checkedIn && (
          <Button variant="danger" icon={LogOut} onClick={handleCheckOut}>
            Check out
          </Button>
        )}
        {canCheckIn && (
          <>
            <Input
              aria-label="Check-in note"
              placeholder="Optional note, e.g. working remotely"
              value={notes}
              maxLength={140}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
            />
            <Button icon={CheckCircle2} onClick={handleCheckIn}>
              Check in
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
