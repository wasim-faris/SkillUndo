import { useEffect, useMemo, useState } from 'react';
import { HiOutlineUsers, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import DashboardTable from '../../components/admin/DashboardTable';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import useAdminQuery from '../../hooks/useAdminQuery';
import { getAdminUsers } from '../../api/admin';
import { paginateData } from '../../utils/pagination';
import { formatDateOnly, isForbidden, safeText } from '../../utils/admin';

export default function AdminUsers() {
  const users = useAdminQuery(getAdminUsers);
  const data = Array.isArray(users.data) ? users.data : [];
  const accessDenied = isForbidden(users.error);
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
        rows={pageRows}
        loading={users.loading}
        error={users.error}
        onRetry={() => users.reload().catch(() => { })}
        emptyIcon={<HiOutlineUsers size={26} />}
        emptyTitle="No users available"
        emptyDescription="There are no users in the registry yet."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

