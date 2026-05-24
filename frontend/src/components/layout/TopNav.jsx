import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiBell, HiSearch, HiChat, HiLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

export default function TopNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-center px-6"
         style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}>
      <div className="w-full max-w-[1360px] flex items-center justify-between">

        {/* Brand & Search */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'var(--gradient-1)' }}
            >
              <HiLightningBolt className="text-white w-5 h-5" />
            </motion.div>
            <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight hidden md:block">
              SkillUndo
            </span>
          </Link>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl w-80 transition-all focus-within:border-[var(--accent-primary)]"
               style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            <HiSearch size={18} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search for skills or people..."
              className="bg-transparent border-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 w-full p-0 outline-none"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          <Link to="/messages" className="relative group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-default)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] text-[var(--text-secondary)] transition-all">
              <HiChat size={20} />
            </div>
            {/* Unread badge example */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--accent-secondary)] rounded-full border-2 border-[var(--bg-card)]"></span>
          </Link>

          <button className="relative group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-default)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] text-[var(--text-secondary)] transition-all">
              <HiBell size={20} />
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-card)]"></span>
          </button>

          <div className="h-6 w-[1px] bg-[var(--border-default)] mx-2"></div>

          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar
              firstName={user?.name?.split(' ')[0] || 'U'}
              lastName={user?.name?.split(' ')[1] || 'S'}
              src={user?.photo}
              size="sm"
              className="!w-10 !h-10 !rounded-full border-2 border-[var(--accent-primary)]"
            />
          </Link>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-red-500/30 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all duration-200 active:scale-95 shrink-0"
            title="Logout"
          >
            <HiLogout size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
