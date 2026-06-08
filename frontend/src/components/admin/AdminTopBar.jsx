import { useNavigate } from 'react-router-dom';
import { HiOutlineBars3, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

export default function AdminTopBar({ sectionLabel = 'Dashboard', onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || 'Admin';
  const email = user?.email || 'admin@skillswap.local';

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] transition-colors hover:text-[var(--admin-text)] lg:hidden"
            aria-label="Open admin navigation"
          >
            <HiOutlineBars3 size={22} />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--admin-text-secondary)]">
              Admin Dashboard
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--admin-text)]">{sectionLabel}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2">
            <Avatar
              theme="admin"
              firstName={name.split(' ')[0]}
              lastName={name.split(' ').slice(1).join(' ')}
              src={user?.photo}
              size="sm"
              className="!h-9 !w-9"
            />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-[var(--admin-text)]">{name}</p>
              <p className="truncate text-xs text-[var(--admin-text-secondary)]">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)] transition-colors hover:border-[var(--admin-danger)] hover:text-[var(--admin-danger)]"
          >
            <HiOutlineArrowRightOnRectangle size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
