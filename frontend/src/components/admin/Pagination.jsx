import { useMemo } from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4">
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all focus:outline-none ${currentPage === 1
                        ? 'cursor-not-allowed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)]'
                        : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                    }`}
            >
                &lt; Previous
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2">
                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`inline-flex min-w-[38px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus:outline-none ${page === currentPage
                                ? 'border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white'
                                : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all focus:outline-none ${currentPage === totalPages
                        ? 'cursor-not-allowed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)]'
                        : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                    }`}
            >
                Next &gt;
            </button>
        </div>
    );
}
