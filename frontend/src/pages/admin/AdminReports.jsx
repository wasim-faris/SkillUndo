import { useEffect, useMemo, useState } from 'react';
import { HiOutlineClipboardDocumentList, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import DashboardTable from '../../components/admin/DashboardTable';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import useAdminQuery from '../../hooks/useAdminQuery';
import { getAdminReports } from '../../api/admin';
import { paginateData } from '../../utils/pagination';
import { isForbidden, safeText } from '../../utils/admin';

export default function AdminReports() {
  const reports = useAdminQuery(getAdminReports);
  const data = Array.isArray(reports.data) ? reports.data : [];
  const accessDenied = isForbidden(reports.error);
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
    { key: 'reporter', label: 'Reporter', render: (row) => safeText(row.reporter) },
    { key: 'reported_user', label: 'Reported User', render: (row) => safeText(row.reported_user) },
    { key: 'reason', label: 'Reason', render: (row) => safeText(row.reason) },
    { key: 'description', label: 'Description', render: (row) => safeText(row.description) },
  ];

  if (accessDenied) {
    return (
      <EmptyState
        tone="danger"
        icon={<HiOutlineExclamationTriangle size={26} />}
        title="Admin access denied"
        description="The reports endpoint rejected this account."
        actionLabel="Retry"
        onAction={() => reports.reload().catch(() => { })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--admin-text-secondary)]">Reports</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">Moderation queue</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--admin-text-secondary)]">
          This view uses the existing reports admin endpoint. Fields not exposed by the backend will remain unavailable.
        </p>
      </section>

      <DashboardTable
        title="All Reports"
        description="Current moderation reports from the admin API."
        columns={columns}
        rows={pageRows}
        loading={reports.loading}
        error={reports.error}
        onRetry={() => reports.reload().catch(() => { })}
        emptyIcon={<HiOutlineClipboardDocumentList size={26} />}
        emptyTitle="No reports available"
        emptyDescription="There are no moderation reports right now."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

