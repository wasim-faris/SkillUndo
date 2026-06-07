import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

export default function DashboardTable({
  title,
  description,
  columns,
  rows,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing to show yet',
  emptyDescription = 'There is no data for this section right now.',
  emptyIcon,
  rowKey = 'id',
  className = '',
}) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <section className={`rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${className}`}>
      <div className="border-b border-[var(--admin-border)] px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--admin-text)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{description}</p>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} columns={columns.length} className="rounded-none border-0" />
      ) : error ? (
        <div className="p-5">
          <EmptyState
            tone="danger"
            icon={emptyIcon}
            title="Unable to load data"
            description={description || emptyDescription}
            actionLabel="Retry"
            onAction={onRetry}
          />
        </div>
      ) : hasRows ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--admin-surface)]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-secondary)] ${column.headerClassName || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row?.[rowKey] ?? rowIndex} className="border-t border-[var(--admin-border)] transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  {columns.map((column) => {
                    const value = column.render ? column.render(row, rowIndex) : row?.[column.key];

                    return (
                      <td key={column.key} className={`px-5 py-4 text-sm text-[var(--admin-text)] ${column.cellClassName || ''}`}>
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={onRetry ? 'Retry' : undefined}
            onAction={onRetry}
          />
        </div>
      )}
    </section>
  );
}

