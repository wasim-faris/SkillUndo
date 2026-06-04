import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiChat, HiLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { getChats } from '../../api/chat';
import toast from 'react-hot-toast';

export default function TopNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await getChats();
        const chats = res?.data?.data ?? res?.data ?? [];
        const count = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 4000);

    const handleUpdate = (e) => {
      setUnreadCount(e.detail);
    };
    window.addEventListener('unread-count-update', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('unread-count-update', handleUpdate);
    };
  }, [user?.id]);

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


        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          <Link to="/messages" className="relative group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-default)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] text-[var(--text-secondary)] transition-all">
              <HiChat size={20} />
            </div>
            {/* Unread badge example */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--accent-secondary)] rounded-full border-2 border-[var(--bg-card)]"></span>
            )}
          </Link>



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
