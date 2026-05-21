import { motion } from 'framer-motion';
import { HiThumbUp, HiChatAlt, HiShare, HiOutlineThumbUp, HiLightningBolt } from 'react-icons/hi';
import Avatar from '../ui/Avatar';
import SkillPill from '../ui/SkillPill';

export default function PostCard({ post, onUserClick }) {
  const nameParts = (post.author || '').split(' ');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-premium p-6 hover:bg-[var(--bg-hover)]"
    >
      <div className="flex gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={onUserClick} 
          className="shrink-0 focus:outline-none h-11 w-11 rounded-full overflow-hidden"
        >
          <div className="w-full h-full bg-[var(--gradient-1)] flex items-center justify-center text-white font-bold text-sm">
            {nameParts[0]?.[0]}{nameParts[1]?.[0]}
          </div>
        </motion.button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <button 
              onClick={onUserClick}
              className="text-[15px] font-semibold text-[var(--accent-primary)] hover:underline transition-colors truncate"
            >
              {post.author}
            </button>
            <span className="text-xs text-[var(--text-muted)]">{post.time}</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] uppercase font-medium tracking-[0.05em] mb-3">
            {post.authorRole}
          </p>

          <p className="text-[15px] text-[var(--text-secondary)] leading-[1.65] mb-5 whitespace-pre-wrap">
            {post.content}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.skills?.map((skill, idx) => (
              <span 
                key={idx} 
                className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--accent-primary)] text-[12px] font-medium hover:bg-[rgba(124,111,247,0.1)] hover:border-[rgba(124,111,247,0.4)] transition-all cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[var(--border-default)]">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
          <HiOutlineThumbUp size={18} />
          <span>Inspire</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
          <HiChatAlt size={18} />
          <span>Discuss</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
          <HiShare size={18} />
          <span>Circulate</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all text-[13px] font-medium">
          <HiLightningBolt size={18} />
          <span>Swap</span>
        </button>
      </div>
    </motion.div>
  );
}


