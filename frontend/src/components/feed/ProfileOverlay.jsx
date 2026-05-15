import { HiX, HiChat, HiLink, HiLocationMarker, HiGlobe, HiStar, HiAcademicCap } from 'react-icons/hi';
import Avatar from '../ui/Avatar';
import SkillPill from '../ui/SkillPill';
import Button from '../ui/Button';

export default function ProfileOverlay({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  const nameParts = (user.author || user.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[var(--bg-secondary)] rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-modal overflow-hidden max-h-[95vh] flex flex-col border border-[var(--border-default)]">
        
        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-8 pb-10 -mt-14 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-start">
            <Avatar 
              firstName={firstName} 
              lastName={lastName} 
              src={user.photo}
              size="2xl" 
              className="!w-28 !h-28 !border-4 !border-[var(--bg-secondary)] shadow-2xl" 
            />
            
            <div className="w-full mt-4">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-primary)] leading-tight">{user.author || user.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <p className="text-sm text-[var(--accent-primary)] font-bold">@{ (user.author || user.name || '').toLowerCase().replace(/\s+/g, '') }</p>
                    {user.city && (
                      <span className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider">
                        <HiLocationMarker size={14} /> {user.city}
                      </span>
                    )}
                    {user.language && (
                      <span className="flex items-center gap-1 text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider">
                        <HiGlobe size={14} /> {user.language}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="!rounded-full px-4 border-[var(--border-hover)]"><HiChat size={20} /></Button>
                  <Button size="sm" className="!rounded-full px-8">Connect</Button>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-6 text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">
                {user.bio || `SkillSwapper enthusiast passionate about sharing knowledge. Currently focused on ${user.authorRole || 'collaborative learning'}.`}
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-y border-[var(--border-default)]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[var(--text-primary)] mb-0.5">
                    <HiStar className="text-yellow-500" size={16} />
                    <span className="text-lg font-black">{user.avg_rating || '4.9'}</span>
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Rating</p>
                </div>
                <div className="text-center border-x border-[var(--border-default)]">
                  <div className="flex items-center justify-center gap-1 text-[var(--text-primary)] mb-0.5">
                    <HiAcademicCap className="text-[var(--accent-primary)]" size={16} />
                    <span className="text-lg font-black">{user.sessions || '24'}</span>
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sessions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[var(--text-primary)] mb-0.5">
                    <span className="text-lg font-black">{user.credits || '120'}</span>
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Credits</p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-8">
                <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Top Skills</h3>
                <div className="flex flex-wrap gap-2.5">
                  {(user.skills || ['React', 'UI/UX', 'System Design']).map((skill, idx) => (
                    <SkillPill key={idx} name={skill} type={idx % 2 === 0 ? 'teaching' : 'learning'} />
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-10 flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-primary)] hover:underline cursor-pointer group">
                  <HiLink size={16} className="group-hover:rotate-12 transition-transform" />
                  <span>portfolio.dev/{(user.author || user.name || '').toLowerCase().replace(/\s+/g, '')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
