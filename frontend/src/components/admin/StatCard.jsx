const toneStyles = {
  primary: {
    icon: 'text-[var(--admin-accent)] bg-[rgba(124,140,255,0.12)]',
    border: 'border-[rgba(124,140,255,0.24)]',
  },
  success: {
    icon: 'text-[var(--admin-success)] bg-[rgba(34,197,94,0.12)]',
    border: 'border-[rgba(34,197,94,0.24)]',
  },
  warning: {
    icon: 'text-[var(--admin-warning)] bg-[rgba(245,158,11,0.12)]',
    border: 'border-[rgba(245,158,11,0.24)]',
  },
  danger: {
    icon: 'text-[var(--admin-danger)] bg-[rgba(239,68,68,0.12)]',
    border: 'border-[rgba(239,68,68,0.24)]',
  },
  neutral: {
    icon: 'text-[var(--admin-text-secondary)] bg-[rgba(148,163,184,0.12)]',
    border: 'border-[var(--admin-border)]',
  },
};

export default function StatCard({ icon, label, value, helper, tone = 'neutral', className = '' }) {
  const styles = toneStyles[tone] || toneStyles.neutral;

  return (
    <div className={`rounded-2xl border ${styles.border} bg-[var(--admin-card)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${className}`}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-[var(--admin-text)]">{value}</div>
      <div className="mt-2 text-sm font-medium text-[var(--admin-text-secondary)]">{label}</div>
      {helper ? <div className="mt-3 text-xs text-[var(--admin-text-secondary)]">{helper}</div> : null}
    </div>
  );
}

