import { useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

const SECTION_LABELS = {
  '/dashboard': 'Dashboard',
  '/dashboard/reports': 'Reports',
  '/dashboard/sessions': 'Sessions',
  '/dashboard/users': 'Users',
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const sectionLabel = SECTION_LABELS[location.pathname] || 'Dashboard';

  return (
    <div className="admin-shell min-h-screen">
      <div className="flex min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]">
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopBar sectionLabel={sectionLabel} onMenuClick={() => setMobileOpen(true)} />

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

