import Avatar from '../ui/Avatar';
import { HiPlus } from 'react-icons/hi';

export default function StoriesRow({ onAddPost }) {
  const stories = [
    { name: 'Alex', initials: ['A', 'X'] },
    { name: 'Jamie', initials: ['J', 'M'] },
    { name: 'Taylor', initials: ['T', 'L'] },
    { name: 'Jordan', initials: ['J', 'D'] },
    { name: 'Casey', initials: ['C', 'S'] },
    { name: 'Morgan', initials: ['M', 'G'] },
    { name: 'Riley', initials: ['R', 'L'] },
    { name: 'Sasha', initials: ['S', 'H'] },
  ];

  return (
    <div className="card-premium !p-4 mb-6 flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
      
      {/* Add Story Button */}
      <button 
        onClick={onAddPost}
        className="flex flex-col items-center gap-1.5 shrink-0 group"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] border-2 border-dashed border-[var(--border-hover)] flex items-center justify-center group-hover:border-[var(--accent-primary)] transition-colors">
            <HiPlus size={24} className="text-[var(--text-placeholder)] group-hover:text-[var(--accent-primary)]" />
          </div>
        </div>
        <span className="text-[11px] font-bold text-[var(--text-secondary)]">Your Match</span>
      </button>

      {/* Stories */}
      {stories.map((story, idx) => (
        <div 
          key={idx} 
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)]">
            <div className="p-0.5 rounded-full bg-[var(--bg-secondary)]">
              <Avatar firstName={story.initials[0]} lastName={story.initials[1]} size="xl" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}
