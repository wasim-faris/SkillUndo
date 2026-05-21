import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiVideoCamera, HiCheck, HiX, HiDotsHorizontal, HiChat } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';

const STATIC_SESSIONS = [
  {
    id: 1,
    partner: 'Rahul Desai',
    role: 'React Developer',
    type: 'Incoming Swap',
    topic: 'Advanced React Patterns',
    date: 'Today',
    time: '4:00 PM - 5:00 PM IST',
    status: 'Upcoming',
    link: 'meet.google.com/abc-defg-hij',
    isHost: false,
    photo: null
  },
  {
    id: 2,
    partner: 'Sneha M',
    role: 'UI/UX Designer',
    type: 'Outgoing Swap',
    topic: 'Figma Basics for Devs',
    date: 'Tomorrow',
    time: '2:00 PM - 3:00 PM IST',
    status: 'Upcoming',
    link: 'meet.google.com/xyz-uvwx-yz',
    isHost: true,
    photo: null
  },
  {
    id: 3,
    partner: 'Karthik Iyer',
    role: 'Backend Engineer',
    type: 'Incoming Swap',
    topic: 'System Design Interview Prep',
    date: 'May 15, 2026',
    time: '6:00 PM - 7:00 PM IST',
    status: 'Completed',
    link: '',
    isHost: false,
    photo: null
  }
];

function SessionCard({ session }) {
  const isUpcoming = session.status === 'Upcoming';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-premium p-6 border-l-4 ${isUpcoming ? 'border-l-[var(--accent-primary)]' : 'border-l-[var(--border-default)]'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <Avatar firstName={session.partner.split(' ')[0]} lastName={session.partner.split(' ')[1] || ''} className="!w-12 !h-12 !rounded-xl" />
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{session.partner}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{session.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${isUpcoming ? 'bg-[rgba(124,111,247,0.1)] text-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
            {session.status}
          </span>
          <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <HiDotsHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1">{session.type}</p>
        <p className="text-[15px] font-medium text-[var(--text-primary)]">{session.topic}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2.5 rounded-xl border border-[var(--border-default)]">
          <HiCalendar size={18} className="text-[var(--accent-primary)]" />
          {session.date}
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2.5 rounded-xl border border-[var(--border-default)]">
          <HiClock size={18} className="text-[var(--accent-secondary)]" />
          {session.time}
        </div>
      </div>

      {isUpcoming && (
        <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
          <button className="flex-1 btn-primary flex items-center justify-center gap-2 !py-2.5">
            <HiVideoCamera size={18} /> Join Call
          </button>
          <button className="flex-1 btn-ghost flex items-center justify-center gap-2 !py-2.5">
            <HiChat size={18} /> Message
          </button>
          <button className="px-4 border border-[var(--border-default)] rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:border-red-400 transition-colors">
            <HiX size={20} />
          </button>
        </div>
      )}
      
      {!isUpcoming && (
        <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
          <button className="flex-1 btn-ghost flex items-center justify-center gap-2 !py-2.5 text-[var(--text-muted)]">
            Leave Feedback
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Sessions() {
  const [filter, setFilter] = useState('Upcoming');

  const filteredSessions = STATIC_SESSIONS.filter(s => {
    if (filter === 'Upcoming') return s.status === 'Upcoming';
    if (filter === 'Completed') return s.status === 'Completed';
    return true;
  });

  return (
    <AppLayout>
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-premium p-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] ml-2">My Sessions</h1>
          
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-default)]">
            {['Upcoming', 'Completed', 'All'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.length > 0 ? (
            filteredSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <div className="col-span-full card-premium p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-4">
                <HiCalendar className="text-[var(--text-muted)] w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No {filter.toLowerCase()} sessions</h2>
              <p className="text-[var(--text-secondary)]">You don't have any sessions right now. Head over to the Feed or Matches to request a swap!</p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
