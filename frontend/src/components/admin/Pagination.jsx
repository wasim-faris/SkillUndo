export default function Pagination({ currentPage, hasPrevious, hasNext, onPrevious, onNext }) {
    if (!hasPrevious && !hasNext) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <button
                type="button"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className={`inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all focus:outline-none sm:w-auto ${!hasPrevious
                    ? 'cursor-not-allowed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                    }`}
            >
                &lt; Previous
            </button>

            <div className="text-center text-sm font-semibold text-[var(--admin-text)]">Page {currentPage}</div>

            <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                className={`inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all focus:outline-none sm:w-auto ${!hasNext
                    ? 'cursor-not-allowed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                    }`}
            >
                Next &gt;
            </button>
        </div>
    );
}
