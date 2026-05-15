import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { HiPhotograph, HiVideoCamera, HiCalendar, HiLightningBolt } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function PostBar({ onOpenModal }) {
  const { user } = useAuth();
  const nameParts = (user?.name || '').split(' ');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium !p-5"
    >
      <div className="flex items-center gap-4">
        <Avatar 
          firstName={nameParts[0]} 
          lastName={nameParts[1]} 
          src={user?.photo}
          size="md" 
          className="!w-10 !h-10 !rounded-full bg-[#2f2f2f]"
        />
        <div className="flex-1 relative">
          <input 
            id="post-input"
            type="text"
            placeholder="Share an insight or request a skill..."
            className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[15px] text-[#6b6b6b] focus:text-[#ececec] focus:border-[#d97757]/50 transition-all outline-none"
            onClick={onOpenModal}
            readOnly
          />
        </div>

      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-1">
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#a8a8a8] hover:text-[#ececec] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiPhotograph size={18} className="text-blue-400" />
            <span>Visual</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#a8a8a8] hover:text-[#ececec] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiVideoCamera size={18} className="text-orange-400" />
            <span>Stream</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#a8a8a8] hover:text-[#ececec] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiCalendar size={18} className="text-green-400" />
            <span>Session</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#a8a8a8] hover:text-[#ececec] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiLightningBolt size={18} className="text-yellow-500" />
            <span>Swap</span>
          </button>
        </div>

        <button 
          onClick={onOpenModal}
          className="bg-[#d97757] text-white px-5 py-2 rounded-lg font-bold text-[13px] hover:bg-[#c4643f] transition-all"
        >
          Post
        </button>
      </div>
    </motion.div>

  );
}

