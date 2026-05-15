import { useState, useEffect } from 'react';
import { HiCheckCircle, HiStar, HiCalendar } from 'react-icons/hi';
import Avatar from './Avatar';

const Scene1 = ({ active }) => (
  <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-[600ms] ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
    <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">🎯</span>
        <h4 className="font-semibold text-white text-[15px] tracking-tight">New Match Found</h4>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar firstName="Arjun" size="sm" />
          <p className="text-sm text-[var(--text-secondary)]"><strong className="text-white">Arjun</strong> teaches <span className="text-[var(--accent-primary)] font-medium">Python</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-dashed border-[var(--border-hover)] flex items-center justify-center text-xs text-[var(--text-muted)]">?</div>
          <p className="text-sm text-[var(--text-secondary)]">wants to learn: <span className="text-[var(--accent-secondary)] font-medium">UI/UX Design</span></p>
        </div>
      </div>
      <button className="mt-6 w-full bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20 rounded-lg py-2.5 text-sm font-semibold animate-pulse transition-all">
        Connect
      </button>
    </div>
  </div>
);

const Scene2 = ({ active }) => (
  <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-[600ms] ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
    <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
      <HiCalendar className="w-10 h-10 text-[var(--accent-primary)] mx-auto mb-3" />
      <h4 className="font-semibold text-white text-[15px] mb-1">Session Confirmed</h4>
      <p className="text-xs text-[var(--text-secondary)] mb-5">Saturday 3:00 PM • 1 hour</p>
      
      <div className="flex justify-center items-center mb-5">
        <Avatar firstName="Arjun" size="md" className="-mr-3 z-10 border-4 border-[#111111]" />
        <Avatar firstName="You" size="md" className="border-4 border-[#111111]" />
      </div>
      
      <div className="flex justify-center gap-2 mb-5">
        <span className="px-2.5 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] rounded text-[11px] font-semibold">Python</span>
        <span className="px-2.5 py-1 bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] rounded text-[11px] font-semibold">UI/UX</span>
      </div>
      
      <div className="flex items-center justify-center gap-1.5 text-[#4CAF50] text-sm font-semibold">
        <HiCheckCircle size={18} /> Booked
      </div>
    </div>
  </div>
);

const Scene3 = ({ active }) => (
  <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-[600ms] ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
    <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
      
      {/* Subtle Confetti Dots */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-[#FF6584] rounded-full"></div>
         <div className="absolute top-10 right-8 w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"></div>
         <div className="absolute bottom-8 left-10 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
         <div className="absolute top-1/2 right-4 w-1.5 h-1.5 bg-[#4CAF50] rounded-full"></div>
      </div>

      <h4 className="font-semibold text-white text-[15px] mb-5">⭐ Session Complete</h4>
      <div className="flex justify-center gap-1.5 mb-5">
        {[1,2,3,4,5].map((i) => (
          <HiStar 
            key={i} 
            className={`w-7 h-7 transition-colors duration-500 ease-out`} 
            style={{ 
              color: active ? '#FF6584' : '#282828',
              transitionDelay: active ? `${i * 100}ms` : '0ms'
            }} 
          />
        ))}
      </div>
      <p className="text-sm text-[var(--text-primary)] font-medium mb-3">Arjun rated you 5 stars</p>
      <div className="inline-block px-3 py-1.5 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-md">
        <p className="text-[11px] text-[#4CAF50] font-bold tracking-wide">+1 Credit Earned</p>
      </div>
    </div>
  </div>
);

export default function AuthShowcase() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScene((s) => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[280px] bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl overflow-hidden mb-6 hidden md:block shrink-0">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-[var(--accent-primary)] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <Scene1 active={scene === 0} />
      <Scene2 active={scene === 1} />
      <Scene3 active={scene === 2} />
    </div>
  );
}
