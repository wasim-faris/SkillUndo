import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import StatCard from '../../components/admin/StatCard';
import DashboardTable from '../../components/admin/DashboardTable';
import LoadingSkeleton from '../../components/admin/LoadingSkeleton';
import EmptyState from '../../components/admin/EmptyState';
import useAdminQuery from '../../hooks/useAdminQuery';
import { getAdminDashboard, getAdminReports, getAdminSessions, getAdminUsers } from '../../api/admin';
import {
  asArray,
  formatDateTime,
  isForbidden,
  safeText,
  getStatusTone,
} from '../../utils/admin';

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

export default function AdminDashboard() {
  const stats = useAdminQuery(getAdminDashboard);
  const reports = useAdminQuery(getAdminReports);
  const sessions = useAdminQuery(getAdminSessions);
  const users = useAdminQuery(getAdminUsers);

  const accessDenied = [stats.error, reports.error, sessions.error, users.error].some(isForbidden);
  const statData = stats.data || {};
  const recentReports = asArray(reports.data).slice(0, 5);
  const recentSessions = asArray(sessions.data).slice(0, 5);
  const recentUsers = asArray(users.data).slice(0, 5);

  const reportColumns = [
    {
      key: 'reporter',
      label: 'Reporter',
      render: (row) => safeText(row.reporter),
    },
    {
      key: 'reported_user',
      label: 'Reported User',
      render: (row) => safeText(row.reported_user),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => safeText(row.reason),
    },
  ];

  const sessionColumns = [
    {
      key: 'teach_skill',
      label: 'Teacher Skill',
      render: (row) => safeText(row.teach_skill?.name),
    },
    {
      key: 'learn_skill',
      label: 'Learner Skill',
      render: (row) => safeText(row.learn_skill?.name),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (row) => safeText(formatDateTime(row.created_at)),
    },
  ];

  const userColumns = [
    {
      key: 'name',
      label: 'Username',
      render: (row) => safeText(row.name),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => safeText(row.email),
    },
    {
      key: 'created_at',
      label: 'Joined Date',
      render: (row) => safeText(formatDateTime(row.created_at)),
    },
  ];

  if (accessDenied) {
    return (
      <div className="space-y-6">
        <EmptyState
          tone="danger"
          icon={<HiOutlineExclamationTriangle size={26} />}
          title="Admin access required"
          description="This account can reach the app, but the backend denied access to the admin APIs."
          actionLabel="Retry"
          onAction={() => {
            stats.reload().catch(() => { });
            reports.reload().catch(() => { });
            sessions.reload().catch(() => { });
            users.reload().catch(() => { });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--admin-text-secondary)]">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
              Platform health at a glance
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--admin-text-secondary)]">
              Monitor usage, moderation load, and platform activity from the current admin APIs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              stats.reload().catch(() => { });
              reports.reload().catch(() => { });
              sessions.reload().catch(() => { });
              users.reload().catch(() => { });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)] transition-colors hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]"
          >
            <HiOutlineArrowPath size={18} />
            Refresh all
          </button>
        </div>
      </section>

      {stats.loading ? (
        <LoadingSkeleton variant="stats" rows={5} />
      ) : stats.error ? (
        <EmptyState
          tone="danger"
          icon={<HiOutlineExclamationTriangle size={26} />}
          title="Failed to load dashboard metrics"
          description="The admin stats endpoint is currently unavailable."
          actionLabel="Retry"
          onAction={() => stats.reload().catch(() => { })}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={<HiOutlineUsers size={22} />} label="Total Users" value={statData.total_users ?? 0} tone="primary" />
          <StatCard icon={<HiOutlineClock size={22} />} label="Total Sessions" value={statData.total_sessions ?? 0} tone="neutral" />
          <StatCard icon={<HiOutlineCheckCircle size={22} />} label="Completed Sessions" value={statData.completed_sessions ?? 0} tone="success" />
          <StatCard icon={<HiOutlineXCircle size={22} />} label="Cancelled Sessions" value={statData.cancelled_sessions ?? 0} tone="danger" />
          <StatCard icon={<HiOutlineDocumentText size={22} />} label="Pending Reports" value={statData.pending_reports ?? 0} tone="warning" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardTable
          title="Recent Reports"
          description="Moderation reports from the existing admin endpoint."
          columns={reportColumns}
          rows={recentReports}
          loading={reports.loading}
          error={reports.error}
          onRetry={() => reports.reload().catch(() => { })}
          emptyTitle="No reports available"
          emptyDescription="Submitted reports will appear here once users start flagging content."
        />

        <DashboardTable
          title="Recent Sessions"
          description="Latest skill swap session requests."
          columns={sessionColumns}
          rows={recentSessions}
          loading={sessions.loading}
          error={sessions.error}
          onRetry={() => sessions.reload().catch(() => { })}
          emptyTitle="No sessions available"
          emptyDescription="Recent skill swap sessions will appear here."
        />
      </div>

      <DashboardTable
        title="Recent Users"
        description="Newest user accounts returned by the admin users endpoint."
        columns={userColumns}
        rows={recentUsers}
        loading={users.loading}
        error={users.error}
        onRetry={() => users.reload().catch(() => { })}
        emptyTitle="No users available"
        emptyDescription="User accounts will appear here once the platform has signups."
      />
    </div>
  );
}
