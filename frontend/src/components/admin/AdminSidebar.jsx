import { NavLink } from 'react-router-dom';
import { HiOutlineSquares2X2, HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineUsers } from 'react-icons/hi2';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { to: '/dashboard/reports', label: 'Reports', icon: HiOutlineClipboardDocumentList },
  { to: '/dashboard/sessions', label: 'Sessions', icon: HiOutlineClock },
  { to: '/dashboard/users', label: 'Users', icon: HiOutlineUsers },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
    ? 'bg-[rgba(124,140,255,0.14)] text-[var(--admin-accent)]'
    : 'text-[var(--admin-text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--admin-text)]'
  }`;

export default function AdminSidebar({ mobileOpen = false, onClose }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-label="Close admin navigation"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(88vw,280px)] flex-col border-r border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-5 transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex items-center gap-3 px-2 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-accent)]">
            <HiOutlineSquares2X2 size={22} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-[var(--admin-text)]">Admin Control</div>
            <div className="text-xs text-[var(--admin-text-secondary)]">SkillSwap operations</div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--admin-text-secondary)]">Restricted</p>
          <p className="mt-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
            Internal admin workspace for platform monitoring and moderation.
          </p>
        </div>
      </aside>
    </>
  );
}
