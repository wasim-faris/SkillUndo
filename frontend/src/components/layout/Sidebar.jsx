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
  `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
    isActive
      ? 'bg-[#6C63FF] text-white shadow-lg shadow-purple-100 scale-[1.02]'
      : 'text-gray-500 hover:bg-purple-50 hover:text-[#6C63FF]'
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
        <div className="w-10 h-10 rounded-xl bg-[#6C63FF] flex items-center justify-center shadow-lg shadow-purple-200">
          <HiBolt className="text-white" size={24} />
        </div>
        <span className="font-black text-gray-900 text-2xl tracking-tighter">SkillSwap</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="mt-auto border-t border-gray-100 pt-6 space-y-3">
        <div className="flex items-center gap-4 px-3 py-2">
          <Avatar firstName={user?.first_name} lastName={user?.last_name} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400 font-bold truncate lowercase">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold w-full text-[#FF6584] hover:bg-pink-50 transition-all duration-300 group"
        >
          <HiArrowRightOnRectangle size={22} className="group-hover:translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-6 left-6 z-50 md:hidden bg-white border border-gray-100 rounded-2xl p-3 shadow-xl text-gray-900"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <HiXMark size={24} /> : <HiBars3 size={24} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white z-40 transition-transform duration-500 ease-in-out md:hidden shadow-2xl
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
