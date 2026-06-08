import { HiArrowLeft } from 'react-icons/hi';

export default function MobileBackButton({ label = 'Back', onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] md:hidden ${className}`}
      aria-label={label}
    >
      <HiArrowLeft size={14} />
      <span>{label}</span>
    </button>
  );
}
