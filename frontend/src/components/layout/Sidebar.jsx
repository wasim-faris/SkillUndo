import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiUser,
  HiBolt,
  HiUsers,
  HiBriefcase,
  HiChatBubbleLeftRight,
  HiArrowRightOnRectangle,
  HiOutlineSquares2X2,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import LogoutModal from '../ui/LogoutModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/matches', icon: HiUsers, label: 'Explore' },
  { to: '/sessions', icon: HiBriefcase, label: 'Sessions' },
  { to: '/messages', icon: HiChatBubbleLeftRight, label: 'Messages' },
  { to: '/skills', icon: HiBolt, label: 'My Skills' },
  { to: '/profile', icon: HiUser, label: 'Profile' },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
    ? 'bg-[rgba(124,111,247,0.12)] text-[var(--accent-primary)]'
    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white'
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/', { replace: true });
  };

  const SidebarContent = () => {
    const nameParts = user?.name ? user.name.split(' ') : [];
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    const visibleNavItems = user?.is_staff
      ? [...navItems, { to: '/dashboard', icon: HiOutlineSquares2X2, label: 'Admin Dashboard' }]
      : navItems;

    return (
      <div className="flex h-full flex-col justify-between overflow-y-auto p-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-6 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-primary)]">
              <HiBolt className="text-white" size={24} />
            </div>
            <span className="font-bold text-[var(--text-primary)] text-xl tracking-tight">SkillUndo</span>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            {visibleNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User + Logout */}
        <div className="border-t border-[var(--border-default)] pt-6 mt-6 space-y-4">
          <div className="flex items-center gap-4 px-3 py-1">
            <Avatar firstName={firstName} lastName={lastName} src={user?.photo} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); setShowLogoutModal(true); }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold w-full text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.05)] hover:border-[rgba(239,68,68,0.2)] transition-all duration-200 group active:scale-[0.98]"
          >
            <HiArrowRightOnRectangle size={20} className="transition-transform group-hover:translate-x-0.5" />
            Logout
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 text-[var(--text-primary)] shadow-lg md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <HiXMark size={20} /> : <HiBars3 size={20} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-full w-[min(88vw,18rem)] border-r border-[var(--border-default)] bg-[var(--bg-primary)] transition-transform duration-300 ease-in-out md:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="sticky top-[96px] hidden h-[calc(100vh-120px)] w-72 shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--bg-primary)] md:flex">
        <SidebarContent />
      </aside>

      {showLogoutModal && (
        <LogoutModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
}
