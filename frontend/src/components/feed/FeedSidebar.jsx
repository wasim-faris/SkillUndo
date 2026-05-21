import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { HiHome, HiUsers, HiBriefcase, HiChat, HiUser, HiStar, HiCurrencyDollar, HiLogout } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FeedSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nameParts = (user?.name || 'User').split(' ');

  const navItems = [
    { name: 'Feed', path: '/feed', icon: HiHome },
    { name: 'Matches', path: '/matches', icon: HiUsers },
    { name: 'Sessions', path: '/sessions', icon: HiBriefcase },
    { name: 'Messages', path: '/messages', icon: HiChat },
    { name: 'Profile', path: '/profile', icon: HiUser },
  ];

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
    <aside className="flex flex-col gap-4 w-[280px] shrink-0 sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto pb-6 hidden lg:flex">
      
      {/* Profile Card */}
      <div className="card-premium p-5 flex flex-col items-center text-center animate-fade-in">
        <Avatar 
          firstName={nameParts[0]} 
          lastName={nameParts[1] || ''} 
          src={user?.photo}
          className="!w-[80px] !h-[80px] !rounded-full mb-3 ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-card)]" 
        />
        <h2 className="text-[var(--text-primary)] font-bold text-lg">{user?.name || 'User'}</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4">{user?.city || 'India'}</p>
        
        <div className="flex items-center gap-4 w-full border-t border-[var(--border-default)] pt-4">
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[var(--accent-yellow)] mb-1">
              <HiStar size={16} />
              <span className="font-bold text-[var(--text-primary)]">
                {user?.profile?.avg_rating !== undefined ? Number(user.profile.avg_rating).toFixed(1) : '0.0'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Rating</span>
          </div>
          <div className="w-[1px] h-8 bg-[var(--border-default)]"></div>
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[var(--accent-green)] mb-1">
              <HiCurrencyDollar size={16} />
              <span className="font-bold text-[var(--text-primary)]">
                {user?.profile?.credits !== undefined ? user.profile.credits : '0'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Credits</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="card-premium p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                isActive 
                ? 'bg-[rgba(124,111,247,0.12)] text-[var(--accent-primary)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <div className="h-px bg-[var(--border-default)] my-2"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.05)] hover:border-[rgba(239,68,68,0.15)] group active:scale-[0.98]"
        >
          <HiLogout size={20} className="text-red-400 transition-transform group-hover:translate-x-0.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* My Skills */}
      <div className="card-premium p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">My Skills</h3>
        <div className="flex flex-wrap gap-2">
          <span className="skill-tag tag-coding">React.js</span>
          <span className="skill-tag tag-coding">Python</span>
          <span className="skill-tag tag-design">UI Design</span>
        </div>
      </div>

    </aside>
  );
}
