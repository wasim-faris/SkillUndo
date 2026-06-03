import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiUser,
  HiBolt,
  HiUsers,
  HiBriefcase,
  HiChatBubbleLeftRight,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
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
  `flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-[rgba(124,111,247,0.12)] text-[var(--accent-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white'
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/', { replace: true });
  };

  const SidebarContent = () => {
    const nameParts = user?.name ? user.name.split(' ') : [];
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    return (
      <div className="flex flex-col h-full p-4 justify-between overflow-y-auto">
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
            {navItems.map(({ to, icon: Icon, label }) => (
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
            onClick={handleLogout}
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
        className="fixed top-6 left-6 z-50 md:hidden border rounded-lg p-3 bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-primary)]"
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
          fixed top-0 left-0 h-full w-72 z-40 transition-transform duration-300 ease-in-out md:hidden border-r bg-[var(--bg-primary)] border-[var(--border-default)]
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-r bg-[var(--bg-primary)] border-[var(--border-default)]">
        <SidebarContent />
      </aside>
    </>
  );
}
