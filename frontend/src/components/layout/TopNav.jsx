import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiBell, HiSearch, HiHome, HiUsers, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

export default function TopNav() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/feed', icon: HiHome },
    { name: 'Network', path: '/matches', icon: HiUsers },
    { name: 'Dashboard', path: '/dashboard', icon: HiBriefcase },
    { name: 'Skills', path: '/skills', icon: HiLightningBolt },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-center px-6"
         style={{ background: 'rgba(255, 247, 237, 0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(68, 45, 29, 0.06)' }}>
      <div className="w-full max-w-[1360px] flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #442D1D, #6B4C3B)' }}
            >
              <HiLightningBolt className="text-[#FCECCF] w-5 h-5" />
            </motion.div>
            <span className="text-lg font-extrabold text-coffee-700 tracking-tight hidden md:block">
              SkillSwap
            </span>
          </Link>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl w-72 transition-all"
               style={{ background: 'rgba(68, 45, 29, 0.04)', border: '1px solid rgba(68, 45, 29, 0.06)' }}>
            <HiSearch size={17} className="text-coffee-50" />
            <input
              type="text"
              placeholder="Search skills, people..."
              className="bg-transparent border-none text-sm text-coffee-700 placeholder-coffee-50 focus:ring-0 w-full p-0 outline-none"
            />
          </div>
        </div>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(68, 45, 29, 0.08)' }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={`relative z-10 transition-colors ${isActive ? 'text-coffee-500' : 'text-coffee-50'}`}
                />
                <span className={`text-sm font-semibold relative z-10 hidden lg:inline transition-colors ${isActive ? 'text-coffee-500' : 'text-coffee-50'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="btn-magnetic w-10 h-10 rounded-2xl flex items-center justify-center text-coffee-50 hover:text-coffee-500"
            style={{ background: 'rgba(68, 45, 29, 0.04)' }}
          >
            <HiBell size={20} />
          </motion.button>

          <Link to="/profile" className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-coffee-400/5 transition-all">
            <div className="skill-orb active">
              <Avatar
                firstName={user?.name?.split(' ')[0]}
                lastName={user?.name?.split(' ')[1]}
                src={user?.photo}
                size="sm"
                className="!w-9 !h-9 !rounded-full"
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
