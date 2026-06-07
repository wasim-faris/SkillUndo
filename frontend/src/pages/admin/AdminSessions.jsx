import { useEffect, useMemo, useState } from 'react';
import { HiOutlineClock, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import DashboardTable from '../../components/admin/DashboardTable';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import useAdminQuery from '../../hooks/useAdminQuery';
import { getAdminSessions } from '../../api/admin';
import { paginateData } from '../../utils/pagination';
import { formatDateTime, isForbidden, safeText, getStatusTone } from '../../utils/admin';

const badgeClass = {
  success: 'bg-[rgba(34,197,94,0.12)] text-[var(--admin-success)] border-[rgba(34,197,94,0.24)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-[var(--admin-warning)] border-[rgba(245,158,11,0.24)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[var(--admin-danger)] border-[rgba(239,68,68,0.24)]',
  neutral: 'bg-[rgba(148,163,184,0.12)] text-[var(--admin-text-secondary)] border-[var(--admin-border)]',
};

function StatusBadge({ value }) {
  const tone = getStatusTone(value);
  const styles = badgeClass[tone] || badgeClass.neutral;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${styles}`}>
      {safeText(value)}
    </span>
  );
}

export default function AdminSessions() {
  const sessions = useAdminQuery(getAdminSessions);
  const data = Array.isArray(sessions.data) ? sessions.data : [];
  const accessDenied = isForbidden(sessions.error);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / PAGE_SIZE)), [data.length]);
  const pageRows = useMemo(() => paginateData(data, currentPage, PAGE_SIZE), [data, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const columns = [
    { key: 'teach_skill', label: 'Teacher Skill', render: (row) => safeText(row.teach_skill?.name) },
    { key: 'learn_skill', label: 'Learner Skill', render: (row) => safeText(row.learn_skill?.name) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'created_at', label: 'Created Date', render: (row) => safeText(formatDateTime(row.created_at)) },
  ];

  if (accessDenied) {
    return (
      <EmptyState
        tone="danger"
        icon={<HiOutlineExclamationTriangle size={26} />}
        title="Admin access denied"
        description="The sessions endpoint rejected this account."
        actionLabel="Retry"
        onAction={() => sessions.reload().catch(() => { })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--admin-text-secondary)]">Sessions</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">Session activity</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--admin-text-secondary)]">
          Monitor recent skill swap sessions and their current state.
        </p>
      </section>

      <DashboardTable
        title="All Sessions"
        description="All session requests returned by the admin API."
        columns={columns}
        rows={pageRows}
        loading={sessions.loading}
        error={sessions.error}
        onRetry={() => sessions.reload().catch(() => { })}
        emptyIcon={<HiOutlineClock size={26} />}
        emptyTitle="No sessions available"
        emptyDescription="There are no recent sessions to display."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

