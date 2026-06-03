import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiGlobeAlt, 
  HiBriefcase,
  HiChat,
  HiUserCircle,
  HiLightningBolt
} from 'react-icons/hi';

export default function BottomNav() {
  const navItems = [
    { to: '/matches', icon: HiGlobeAlt, label: 'Explore' },
    { to: '/sessions', icon: HiBriefcase, label: 'Sessions' },
    { to: '/messages', icon: HiChat, label: 'Messages' },
    { to: '/skills', icon: HiLightningBolt, label: 'Skills' },
    { to: '/profile', icon: HiUserCircle, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-[var(--bg-card)] border border-[var(--border-default)] backdrop-blur-xl rounded-full z-50 flex items-center justify-around px-4 shadow-2xl">
      {navItems.map((item, idx) => {
        if (item.action) {
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={item.action}
              className="flex flex-col items-center justify-center min-w-[50px]"
            >
              <item.icon size={32} className="text-[var(--accent-primary)]" />
            </motion.button>
          );
        }
        
        return (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center min-w-[50px] transition-all duration-300
              ${isActive ? 'text-[var(--accent-primary)] scale-110' : 'text-[var(--text-muted)]'}
            `}
          >
            <item.icon size={24} />
            <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}


