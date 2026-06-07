export default function Pagination({ currentPage, hasPrevious, hasNext, onPrevious, onNext }) {
    if (!hasPrevious && !hasNext) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4">
            <button
                type="button"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all focus:outline-none ${!hasPrevious
                    ? 'cursor-not-allowed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                    }`}
            >
                &lt; Previous
            </button>

            <div className="text-sm font-semibold text-[var(--admin-text)]">Page {currentPage}</div>

            <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all focus:outline-none ${!hasNext
                    ? 'cursor-not-allowed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                    }`}
            >
                Next &gt;
            </button>
        </div>
    );
}
