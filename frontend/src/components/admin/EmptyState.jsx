import { HiOutlineInbox } from 'react-icons/hi2';

const toneClasses = {
  default: {
    icon: 'text-[var(--admin-accent)] bg-[rgba(124,140,255,0.12)]',
    border: 'border-[var(--admin-border)]',
  },
  danger: {
    icon: 'text-[var(--admin-danger)] bg-[rgba(239,68,68,0.12)]',
    border: 'border-[rgba(239,68,68,0.24)]',
  },
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'default',
  className = '',
}) {
  const styles = toneClasses[tone] || toneClasses.default;

  return (
    <div className={`rounded-2xl border ${styles.border} bg-[var(--admin-card)] px-4 py-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:px-6 sm:py-10 ${className}`}>
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${styles.icon}`}>
        {icon || <HiOutlineInbox size={26} />}
      </div>
      <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--admin-text-secondary)]">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)] transition-colors hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] sm:w-auto"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
