import { useState } from 'react';
import { HiX, HiPhotograph, HiCalendar, HiGlobeAlt } from 'react-icons/hi';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function PostModal({ isOpen, onClose, onSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const skills = [
    'React', 'UI/UX', 'Python', 'Music', 'Photography', 
    'Writing', 'Video Editing', 'Marketing', 'Java', 'Data Science'
  ];

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handlePost = () => {
    if (!content.trim()) return;
    onSubmit({
      content,
      skills: selectedSkills,
      author: user?.name || 'User',
      authorRole: 'SkillUndo member',
      time: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      isMatch: selectedSkills.length > 1
    });
    setContent('');
    setSelectedSkills([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[var(--bg-secondary)] rounded-xl shadow-2xl animate-modal overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Create a Match Post</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-secondary)] transition-colors"
          >
            <HiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <Avatar firstName={user?.name?.[0]} lastName={user?.name?.split(' ')[1]?.[0]} size="md" />
            <div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">{user?.name || 'User'}</p>
              <button className="flex items-center gap-1.5 px-2 py-0.5 border border-[var(--border-default)] rounded-full text-[12px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                <HiGlobeAlt size={14} />
                <span>Anyone</span>
              </button>
            </div>
          </div>

          <textarea
            autoFocus
            placeholder="What skill are you offering or looking for?"
            className="w-full h-40 bg-transparent text-lg text-[var(--text-primary)] placeholder-[var(--text-placeholder)] outline-none resize-none mb-6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Skill Selector */}
          <div className="mb-6">
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-3">Add skills to your post:</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleSkill(skill)}
                  className={`
                    px-4 py-1.5 rounded-full text-[13px] font-bold border transition-all
                    ${selectedSkills.includes(skill) 
                      ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white border-transparent shadow-md' 
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--accent-primary)]'}
                  `}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[var(--text-secondary)]">
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"><HiPhotograph size={24} /></button>
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"><HiCalendar size={24} /></button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-default)] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-[15px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!content.trim()}
            onClick={handlePost}
            className="px-8 py-2 bg-[var(--accent-primary)] disabled:opacity-50 text-white text-[15px] font-bold rounded-full hover:brightness-110 transition-all shadow-md active:scale-95"
          >
            Post
          </button>
        </div>

      </div>
    </div>
  );
}
