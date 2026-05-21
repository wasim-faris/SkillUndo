import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { HiHome, HiUsers, HiBriefcase, HiChat, HiUser, HiStar, HiCurrencyDollar } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';

export default function FeedSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const nameParts = (user?.name || 'Test User').split(' ');

  const navItems = [
    { name: 'Feed', path: '/feed', icon: HiHome },
    { name: 'Matches', path: '/matches', icon: HiUsers },
    { name: 'Sessions', path: '/sessions', icon: HiBriefcase },
    { name: 'Messages', path: '/messages', icon: HiChat },
    { name: 'Profile', path: '/profile', icon: HiUser },
  ];

  return (
    <aside className="flex flex-col gap-4 w-[280px] shrink-0 sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto pb-6 hidden lg:flex">
      
      {/* Profile Card */}
      <div className="card-premium p-5 flex flex-col items-center text-center">
        <Avatar 
          firstName={nameParts[0]} 
          lastName={nameParts[1] || ''} 
          src={user?.photo}
          className="!w-[80px] !h-[80px] !rounded-full mb-3" 
        />
        <h2 className="text-[var(--text-primary)] font-bold text-lg">{user?.name || 'Test User'}</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4">{user?.city || 'Bangalore, India'}</p>
        
        <div className="flex items-center gap-4 w-full border-t border-[var(--border-default)] pt-4">
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[var(--accent-yellow)] mb-1">
              <HiStar size={16} />
              <span className="font-bold text-[var(--text-primary)]">4.9</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Rating</span>
          </div>
          <div className="w-[1px] h-8 bg-[var(--border-default)]"></div>
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[var(--accent-green)] mb-1">
              <HiCurrencyDollar size={16} />
              <span className="font-bold text-[var(--text-primary)]">150</span>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                ? 'bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
              {item.name}
            </Link>
          );
        })}
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
