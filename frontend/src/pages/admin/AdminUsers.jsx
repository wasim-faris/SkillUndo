import { HiOutlineUsers, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import DashboardTable from '../../components/admin/DashboardTable';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import useAdminPaginatedQuery from '../../hooks/useAdminPaginatedQuery';
import { getAdminUsers } from '../../api/admin';
import { formatDateOnly, isForbidden, safeText } from '../../utils/admin';

export default function AdminUsers() {
  const users = useAdminPaginatedQuery(getAdminUsers);
  const data = users.results;
  const accessDenied = isForbidden(users.error);

  const columns = [
    { key: 'name', label: 'Username', render: (row) => safeText(row.name) },
    { key: 'email', label: 'Email', render: (row) => safeText(row.email) },
    { key: 'created_at', label: 'Joined Date', render: (row) => safeText(formatDateOnly(row.created_at)) },
  ];

  if (accessDenied) {
    return (
      <EmptyState
        tone="danger"
        icon={<HiOutlineExclamationTriangle size={26} />}
        title="Admin access denied"
        description="The users endpoint rejected this account."
        actionLabel="Retry"
        onAction={() => users.reload().catch(() => { })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--admin-text-secondary)]">Users</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">User registry</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--admin-text-secondary)]">
          Review registered accounts from the current admin users endpoint.
        </p>
      </section>

      <DashboardTable
        title="All Users"
        description="Registered users available to the admin API."
        columns={columns}
        rows={data}
        loading={users.loading}
        error={users.error}
        onRetry={() => users.reload().catch(() => { })}
        emptyIcon={<HiOutlineUsers size={26} />}
        emptyTitle="No users available"
        emptyDescription="There are no users in the registry yet."
      />

      <Pagination
        currentPage={users.currentPage}
        hasPrevious={Boolean(users.previous)}
        hasNext={Boolean(users.next)}
        onPrevious={() => users.goToPage(users.currentPage - 1)}
        onNext={() => users.goToPage(users.currentPage + 1)}
      />
    </div>
  );
}

