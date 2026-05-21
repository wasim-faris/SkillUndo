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
          className="!w-10 !h-10 !rounded-full"
        />
        <div className="flex-1 relative">
          <input 
            id="post-input"
            type="text"
            placeholder="Share an insight or request a skill..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-muted)] focus:text-[var(--text-primary)] focus:border-[var(--accent-primary)] transition-all outline-none"
            onClick={onOpenModal}
            readOnly
          />
        </div>

      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-1">
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiPhotograph size={18} className="text-blue-400" />
            <span>Visual</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiVideoCamera size={18} className="text-orange-400" />
            <span>Stream</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiCalendar size={18} className="text-green-400" />
            <span>Session</span>
          </button>
          <button onClick={onOpenModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
            <HiLightningBolt size={18} className="text-yellow-500" />
            <span>Swap</span>
          </button>
        </div>

        <button 
          onClick={onOpenModal}
          className="btn-primary px-5 py-2 rounded-lg font-bold text-[13px]"
        >
          Post
        </button>
      </div>
    </motion.div>
  );
}


