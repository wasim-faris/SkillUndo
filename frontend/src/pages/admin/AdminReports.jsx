import { HiOutlineClipboardDocumentList, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import DashboardTable from '../../components/admin/DashboardTable';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import useAdminPaginatedQuery from '../../hooks/useAdminPaginatedQuery';
import { getAdminReports } from '../../api/admin';
import { isForbidden, safeText } from '../../utils/admin';

export default function AdminReports() {
  const reports = useAdminPaginatedQuery(getAdminReports);
  const data = reports.results;
  const accessDenied = isForbidden(reports.error);

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
        rows={data}
        loading={reports.loading}
        error={reports.error}
        onRetry={() => reports.reload().catch(() => { })}
        emptyIcon={<HiOutlineClipboardDocumentList size={26} />}
        emptyTitle="No reports available"
        emptyDescription="There are no moderation reports right now."
      />

      <Pagination
        currentPage={reports.currentPage}
        hasPrevious={Boolean(reports.previous)}
        hasNext={Boolean(reports.next)}
        onPrevious={() => reports.goToPage(reports.currentPage - 1)}
        onNext={() => reports.goToPage(reports.currentPage + 1)}
      />
    </div>
  );
}

