interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  color?: string;
}

export function ProgressBar({ value, label, showValue, color }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress-block">
      {(label || showValue) && (
        <div className="progress-meta">
          {label && <span>{label}</span>}
          {showValue && <strong>{clamped}%</strong>}
        </div>
      )}
      <div className="progress-container" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="progress-bar" style={{ width: `${clamped}%`, background: color }} />
      </div>
    </div>
  );
}
