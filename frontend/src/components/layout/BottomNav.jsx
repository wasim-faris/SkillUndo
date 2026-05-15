import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    { to: '/notifications', icon: HiBell, label: 'Activity' },
    { to: '/profile', icon: HiUserCircle, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 glass-dark rounded-full z-50 flex items-center justify-around px-4 shadow-2xl shadow-coffee-500/40">
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
              <item.icon size={32} className="text-coffee-500" />
            </motion.button>
          );
        }
        
        return (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center min-w-[50px] transition-all duration-300
              ${isActive ? 'text-coffee-500 scale-110' : 'text-coffee-300'}
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

