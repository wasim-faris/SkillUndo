import { Link, useLocation } from 'react-router-dom';
import { HiLightningBolt, HiPlus, HiBell, HiSearch, HiHome, HiUsers, HiBriefcase, HiChatAlt2 } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

export default function TopNav() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/feed', icon: HiHome },
    { name: 'My Network', path: '/matches', icon: HiUsers },
    { name: 'Dashboard', path: '/dashboard', icon: HiBriefcase },
    { name: 'Skills', path: '/skills', icon: HiLightningBolt },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-[var(--nav-height)] border-b border-neutral-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        
        {/* Brand & Search */}
        <div className="flex items-center gap-2 flex-1">
          <Link to="/" className="flex items-center gap-1 group">
            <div className="w-9 h-9 bg-[#0a66c2] rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
              <HiLightningBolt className="text-white w-6 h-6" />
            </div>
          </Link>

          <div className="hidden sm:flex items-center bg-[#eef3f8] border border-transparent rounded-md px-3 py-1.5 gap-2 w-64 transition-all focus-within:w-80 focus-within:bg-white focus-within:border-neutral-400">
            <HiSearch size={16} className="text-neutral-600" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none text-[14px] text-black placeholder-neutral-500 focus:ring-0 w-full" 
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="flex items-center h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`h-full px-4 flex flex-col items-center justify-center border-b-2 transition-all ${
                  isActive 
                    ? 'border-black text-black' 
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <item.icon size={22} />
                <span className="text-[11px] font-medium hidden md:block mt-0.5">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="h-8 w-[1px] bg-neutral-200 mx-2" />
          
          <button className="h-full px-4 flex flex-col items-center justify-center text-neutral-500 hover:text-black transition-all">
            <HiBell size={22} />
            <span className="text-[11px] font-medium hidden md:block mt-0.5">Notifications</span>
          </button>

          <Link to="/profile" className="h-full px-4 flex flex-col items-center justify-center group">
            <Avatar 
              firstName={user?.name?.split(' ')[0]} 
              lastName={user?.name?.split(' ')[1]} 
              src={user?.photo}
              size="xs" 
              className="!rounded-full"
            />
            <span className="text-[11px] font-medium text-neutral-500 group-hover:text-black mt-0.5 hidden md:block">Me</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}
