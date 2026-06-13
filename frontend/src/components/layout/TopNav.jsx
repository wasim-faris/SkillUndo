import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLightningBolt, HiChat, HiLogout, HiBell, HiCheck, HiX, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import LogoutModal from '../ui/LogoutModal';
import { getChats } from '../../api/chat';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from '../../api/notifications';
import toast from 'react-hot-toast';

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Notification states
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [markingRead, setMarkingRead] = useState(new Set());
  const notifRef = useRef(null);

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

  // Notification Unread Count Polling
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifUnreadCount = async () => {
      try {
        const res = await getUnreadNotificationCount();
        setUnreadNotifCount(res?.data?.data?.count ?? res?.data?.count ?? 0);
      } catch (err) {
        console.error('Error fetching notification unread count:', err);
      }
    };

    fetchNotifUnreadCount();
    const interval = setInterval(fetchNotifUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Click outside logic for notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when opened
  useEffect(() => {
    if (isNotifOpen) {
      const fetchNotifs = async () => {
        setLoadingNotifs(true);
        try {
          const res = await getNotifications();
          setNotifications(res?.data?.data ?? res?.data ?? []);
        } catch {
          toast.error('Failed to load notifications.');
        } finally {
          setLoadingNotifs(false);
        }
      };
      fetchNotifs();
    }
  }, [isNotifOpen]);

  const handleMarkAsRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (markingRead.has(id)) return;
    
    setMarkingRead(prev => new Set(prev).add(id));
    
    try {
      await markNotificationAsRead(id);
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
      
    } catch {
      toast.error('Failed to mark as read.');
    } finally {
      setMarkingRead(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  const isGuest = !user?.id;

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-[100] flex h-[72px] items-center justify-center px-3 sm:px-4 lg:px-6"
         style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}>
      <div className="flex w-full max-w-[1360px] items-center justify-between gap-3 min-w-0">

        {/* Brand & Search */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-6 lg:gap-8">
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
        <div className="flex items-center gap-2 sm:gap-3">
          
          {!isGuest ? (
            <Link to="/messages" className="relative group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] sm:h-10 sm:w-10">
                <HiChat size={18} className="sm:w-5 sm:h-5" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--accent-secondary)] rounded-full border-2 border-[var(--bg-card)]"></span>
              )}
            </Link>
          ) : null}

          {/* Notifications */}
          {!isGuest ? <div className="relative group" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] focus:outline-none sm:h-10 sm:w-10"
            >
              <HiBell size={18} className="sm:w-5 sm:h-5" />
            </button>
            {unreadNotifCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 bg-[var(--accent-primary)] text-white text-[9px] font-bold rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center -translate-y-0.5 translate-x-0.5 shadow-sm">
                {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
              </span>
            )}

            {/* Dropdown */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 flex max-h-[75dvh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl origin-top-right ring-1 ring-black/5 max-md:fixed max-md:left-3 max-md:right-3 max-md:top-[76px] max-md:mt-0 max-md:w-[min(90vw,380px)] max-md:max-h-[70vh] max-md:overflow-y-auto max-md:overflow-x-hidden sm:max-h-[85vh]"
                >
                  <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-secondary)] shrink-0">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm">Notifications</h3>
                    <div className="flex items-center gap-3">
                      {unreadNotifCount > 0 && (
                        <span className="text-[10px] bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                          {unreadNotifCount} New
                        </span>
                      )}
                      <button 
                        onClick={() => setIsNotifOpen(false)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors focus:outline-none"
                      >
                        <HiX size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 overscroll-contain">
                    {loadingNotifs ? (
                      <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-[var(--border-default)] mt-2"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-[var(--border-default)] rounded w-3/4"></div>
                              <div className="h-2 bg-[var(--border-default)] rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] mb-4 border border-[var(--border-default)] shadow-sm">
                           <HiBell size={28} />
                        </div>
                        <p className="text-base font-bold text-[var(--text-primary)]">No notifications yet</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">When you get updates, they'll show up here.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-[var(--border-default)] last:border-none flex gap-3 group transition-all duration-200 ${notif.is_read ? 'opacity-60 bg-transparent hover:opacity-100 hover:bg-[var(--bg-hover)]' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]'}`}
                          >
                            <div className="pt-1.5 shrink-0 flex justify-center w-4">
                               {notif.is_read ? (
                                 <HiCheck size={14} className="text-[var(--text-muted)]" />
                               ) : (
                                 <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] mt-1"></div>
                               )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <p className={`text-sm ${notif.is_read ? 'font-medium text-[var(--text-secondary)]' : 'font-bold text-[var(--text-primary)]'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium uppercase tracking-wide">
                                {new Date(notif.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="shrink-0 flex items-center pt-1">
                                <button
                                  onClick={(e) => handleMarkAsRead(e, notif.id)}
                                  disabled={markingRead.has(notif.id)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 border border-transparent hover:border-[var(--accent-green)]/30 transition-all focus:outline-none disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                  title="Mark as read"
                                >
                                  {markingRead.has(notif.id) ? (
                                    <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-[var(--accent-green)] rounded-full animate-spin"></div>
                                  ) : (
                                    <HiCheckCircle size={20} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div> : null}
          {!isGuest ? <div className="mx-1 h-6 w-px bg-[var(--border-default)] sm:mx-2"></div> : null}

          {isGuest ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost px-3 py-2 text-xs sm:px-4 sm:text-sm">Login</Link>
              <Link to="/register" className="btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">Sign Up</Link>
            </div>
          ) : (
            <>
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar
                  firstName={user?.name?.split(' ')[0] || 'U'}
                  lastName={user?.name?.split(' ')[1] || 'S'}
                  src={user?.photo}
                  size="sm"
                  className="!h-9 !w-9 !rounded-full border-2 border-[var(--accent-primary)] sm:!h-10 sm:!w-10"
                />
              </Link>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95 sm:h-10 sm:w-10"
                title="Logout"
              >
                <HiLogout size={18} className="sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>

    {showLogoutModal && (
      <LogoutModal
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    )}
    </>
  );
}
