export default function LoadingSkeleton({ variant = 'table', rows = 5, columns = 4, className = '' }) {
  if (variant === 'stats') {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] animate-pulse"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-[rgba(255,255,255,0.05)]" />
              <div className="h-8 w-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
            </div>
            <div className="h-10 w-24 rounded-xl bg-[rgba(255,255,255,0.05)]" />
            <div className="mt-3 h-4 w-28 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${className}`}>
      <div className="border-b border-[var(--admin-border)] px-5 py-4">
        <div className="h-5 w-40 rounded-lg bg-[rgba(255,255,255,0.05)] animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded-lg bg-[rgba(255,255,255,0.04)] animate-pulse" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[var(--admin-surface)]">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-5 py-4 text-left">
                  <div className="h-4 w-24 rounded-lg bg-[rgba(255,255,255,0.05)] animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-[var(--admin-border)]">
                {Array.from({ length: columns }).map((__, columnIndex) => (
                  <td key={columnIndex} className="px-5 py-4">
                    <div
                      className="h-4 rounded-lg bg-[rgba(255,255,255,0.04)] animate-pulse"
                      style={{ width: `${55 + ((rowIndex + columnIndex) % 3) * 15}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

