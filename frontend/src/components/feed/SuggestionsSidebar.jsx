import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { HiUserAdd, HiInformationCircle, HiChevronRight } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function SuggestionsSidebar() {
  const suggestions = [
    { name: 'Sarah Chen', role: 'Full Stack Dev', initials: ['S', 'C'] },
    { name: 'Marcus Bell', role: 'UX Researcher', initials: ['M', 'B'] },
    { name: 'Elena Rodriguez', role: 'Language Coach', initials: ['E', 'R'] },
  ];

  return (
    <aside className="flex flex-col gap-3 w-full">
      
      {/* Suggestions Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium !p-0 overflow-hidden"
      >
        <div className="p-5 pb-3.5 flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-[#ececec] uppercase tracking-[0.1em]">Growth Network</h3>
          <HiInformationCircle size={16} className="text-[#6b6b6b]" />
        </div>

        <div className="flex flex-col">
          {suggestions.map((person, idx) => (
            <div key={idx} className="flex items-center gap-3 px-5 py-3.5 border-t border-[#1f1f1f] group transition-all">
              <div className="w-11 h-11 shrink-0 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-bold text-[#ececec] border border-[#3a3a3a]">
                {person.initials[0]}{person.initials[1]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#ececec] group-hover:text-[#d97757] transition-colors cursor-pointer truncate mb-0.5">{person.name}</p>
                <p className="text-[11px] text-[#6b6b6b] font-medium uppercase tracking-[0.04em]">{person.role}</p>
              </div>
              <button className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#d97757]/60 text-[#d97757] text-[12px] font-semibold hover:bg-[#d97757] hover:text-[#0f0f0f] transition-all shrink-0">
                <HiUserAdd size={14} />
                <span>Connect</span>
              </button>
            </div>
          ))}
        </div>
        
        <button className="w-full p-5 border-t border-[#2a2a2a] text-[13px] font-medium text-[#d97757] hover:text-[#eca882] transition-all flex items-center justify-between group">
          <span>View Recommendations</span>
          <HiChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Footer Links */}
      <div className="p-5 pt-2 space-y-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {['Intelligence', 'Accessibility', 'Privacy', 'Network'].map(link => (
            <button key={link} className="text-[10px] font-bold text-[#6b6b6b] hover:text-[#ececec] uppercase tracking-widest transition-all">
              {link}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#3a3a3a] uppercase tracking-[0.15em]">
          <div className="w-5 h-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded flex items-center justify-center text-[8px]">SS</div>
          SkillSwap © 2026
        </div>
      </div>
    </aside>
  );
}
