import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { HiBookmark, HiSparkles, HiUsers, HiHashtag, HiLightningBolt } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FeedSidebar() {
  const { user } = useAuth();
  const nameParts = (user?.name || '').split(' ');

  return (
    <aside className="flex flex-col gap-3 w-full">
      
      {/* Profile Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium !p-0 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-20 relative bg-gradient-to-br from-[#d97757] via-[#b85c35] to-[#1c1c1c] overflow-hidden">
           <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        {/* User Profile Info */}
        <div className="px-5 pb-4">
          <Avatar 
            firstName={nameParts[0]} 
            lastName={nameParts[1]} 
            src={user?.photo}
            size="xl" 
            className="!w-[72px] !h-[72px] !rounded-full border-[3px] border-[#1c1c1c] -mt-9 relative z-10 bg-[#2f2f2f]" 
          />
          
          <div className="mt-2.5">
            <Link to="/profile" className="text-lg font-bold text-[#ececec] hover:text-[#d97757] transition-colors">{user?.name || 'User'}</Link>
            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-[#d97757]/15 border border-[#d97757]/40 text-[#d97757] text-[11px] font-semibold uppercase tracking-[0.08em]">
              Skill Architect
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 border-t border-[#2a2a2a]">
          <div className="px-5 py-4 hover:bg-white/5 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1">Connections</p>
            <p className="text-xl font-bold text-[#ececec]">2,410</p>
          </div>
          <div className="px-5 py-4 border-l border-[#2a2a2a] hover:bg-white/5 transition-all cursor-pointer">
            <p className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1">Skill Matches</p>
            <p className="text-xl font-bold text-[#ececec]">18</p>
          </div>
        </div>

        {/* Pro Insights */}
        <div className="border-t border-[#2a2a2a] p-5">
          <p className="text-[10px] text-[#6b6b6b] font-bold uppercase tracking-[0.1em] mb-3">Pro Insights</p>
          <div className="flex items-center gap-2 group cursor-pointer text-[#d97757] hover:underline">
             <HiLightningBolt size={16} />
             <p className="text-[13px] font-medium">Unlock Mentor Tools</p>
          </div>

        </div>
      </motion.div>

      {/* Community Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-premium !p-0"
      >
        <div className="p-5 pb-2">
          <h3 className="text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-[0.08em]">Expert Groups</h3>
        </div>
        <div className="pb-4">
          {['Product Design', 'React Engineers', 'UI/UX Research'].map((item) => (
            <div key={item} className="flex items-center gap-3 px-5 py-2 text-[#ececec] text-sm hover:bg-white/5 cursor-pointer transition-all">
              <HiUsers size={18} className="text-[#6b6b6b]" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="p-5 pt-2 pb-2 border-t border-[#2a2a2a]">
          <h3 className="text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-[0.08em]">Skill Tags</h3>
        </div>
        <div className="pb-5">
          {['#Frontend', '#DesignSystem', '#Mentorship'].map((item) => (
            <div key={item} className="flex items-center gap-3 px-5 py-2 text-[#ececec] text-sm hover:bg-white/5 cursor-pointer transition-all">
              <HiHashtag size={18} className="text-[#6b6b6b]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}
