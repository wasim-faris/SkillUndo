import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiSquares2X2,
  HiUser,
  HiBolt,
  HiUsers,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: HiSquares2X2, label: 'Dashboard' },
  { to: '/profile', icon: HiUser, label: 'My Profile' },
  { to: '/skills', icon: HiBolt, label: 'My Skills' },
  { to: '/matches', icon: HiUsers, label: 'Matches' },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-[var(--accent-primary)] text-white'
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-6 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-primary)]">
          <HiBolt className="text-white" size={24} />
        </div>
        <span className="font-bold text-[var(--text-primary)] text-xl tracking-tight">SkillSwap</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="mt-auto border-t border-[var(--border-default)] pt-6 space-y-3">
        <div className="flex items-center gap-4 px-3 py-2">
          <Avatar firstName={user?.first_name} lastName={user?.last_name} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium w-full text-[var(--error)] hover:bg-[rgba(255,68,68,0.1)] transition-all duration-150 group"
        >
          <HiArrowRightOnRectangle size={20} />
          Logout
        </button>
      </div>
    </div>
  );

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
