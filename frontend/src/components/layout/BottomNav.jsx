import { NavLink } from 'react-router-dom';
import { 
  HiHome, 
  HiGlobeAlt, 
  HiPlusCircle, 
  HiBell, 
  HiUserCircle 
} from 'react-icons/hi';

export default function BottomNav({ onAddPost }) {
  const navItems = [
    { to: '/feed', icon: HiHome, label: 'Home' },
    { to: '/matches', icon: HiGlobeAlt, label: 'Explore' },
    { action: onAddPost, icon: HiPlusCircle, label: 'Post', special: true },
    { to: '/notifications', icon: HiBell, label: 'Notifications' },
    { to: '/profile', icon: HiUserCircle, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-t border-[var(--border-default)] z-50 flex items-center justify-around px-2 md:hidden">
      {navItems.map((item, idx) => {
        if (item.action) {
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px]"
            >
              <item.icon size={28} className="text-[var(--accent-primary)] hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium text-[var(--text-secondary)]">{item.label}</span>
            </button>
          );
        }
        
        return (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors
              ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-placeholder)]'}
            `}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
