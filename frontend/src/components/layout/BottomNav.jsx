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
    <div className="fixed bottom-4 left-1/2 z-50 flex h-16 w-[min(96vw,24rem)] -translate-x-1/2 items-center justify-around rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] px-2 shadow-2xl backdrop-blur-xl md:hidden">
      {navItems.map((item, idx) => {
        if (item.action) {
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={item.action}
              className="flex min-w-[44px] flex-col items-center justify-center"
            >
              <item.icon size={28} className="text-[var(--accent-primary)]" />
            </motion.button>
          );
        }
        
        return (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) => `
              relative flex min-w-[44px] flex-col items-center justify-center transition-all duration-300
              ${isActive ? 'text-[var(--accent-primary)] scale-110' : 'text-[var(--text-muted)]'}
            `}
          >
            <item.icon size={22} />
            <span className="mt-0.5 text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

