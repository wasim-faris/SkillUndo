import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiBadgeCheck, HiLocationMarker, HiTranslate } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';

const STATIC_MATCHES = [
  {
    id: 1,
    name: 'Priya Sharma',
    city: 'Bangalore',
    language: 'English, Hindi',
    verified: true,
    teaches: ['Python', 'Data Science'],
    wants: ['UI/UX', 'Figma'],
    score: 95,
    credits: 150,
    photo: null
  },
  {
    id: 2,
    name: 'Rahul Desai',
    city: 'Mumbai',
    language: 'English, Marathi',
    verified: true,
    teaches: ['React.js', 'Node.js'],
    wants: ['Digital Marketing'],
    score: 88,
    credits: 220,
    photo: null
  },
  {
    id: 3,
    name: 'Anjali Gupta',
    city: 'Delhi',
    language: 'English, Hindi',
    verified: false,
    teaches: ['Video Editing', 'Premiere Pro'],
    wants: ['React.js'],
    score: 82,
    credits: 50,
    photo: null
  },
  {
    id: 4,
    name: 'Vikram Singh',
    city: 'Pune',
    language: 'English',
    verified: true,
    teaches: ['AWS', 'DevOps'],
    wants: ['Spoken English'],
    score: 75,
    credits: 180,
    photo: null
  },
  {
    id: 5,
    name: 'Neha Reddy',
    city: 'Hyderabad',
    language: 'English, Telugu',
    verified: false,
    teaches: ['SEO', 'Content Writing'],
    wants: ['Python'],
    score: 91,
    credits: 95,
    photo: null
  },
  {
    id: 6,
    name: 'Karthik Iyer',
    city: 'Chennai',
    language: 'English, Tamil',
    verified: true,
    teaches: ['Java', 'Spring Boot'],
    wants: ['AWS', 'Docker'],
    score: 86,
    credits: 110,
    photo: null
  }
];

function MatchProgress({ score }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          className="text-[var(--border-default)]"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="32"
          cy="32"
        />
        <circle
          className="text-[var(--accent-primary)] transition-all duration-1000 ease-in-out"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="32"
          cy="32"
        />
      </svg>
      <span className="absolute text-[12px] font-bold text-[var(--text-primary)]">{score}%</span>
    </div>
  );
}

function MatchCard({ match, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: parseFloat(delay) }}
      className="card-premium group p-6 flex flex-col h-full hover:border-[var(--accent-primary)] hover:shadow-[0_0_15px_rgba(124,111,247,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <Avatar firstName={match.name.split(' ')[0]} lastName={match.name.split(' ')[1]} size="xl" className="!w-16 !h-16 !rounded-full ring-2 ring-[var(--border-default)] group-hover:ring-[var(--accent-primary)] transition-all" />
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{match.name}</h3>
              {match.verified && <HiBadgeCheck className="text-[var(--accent-primary)] w-5 h-5" />}
            </div>
            <div className="flex flex-col gap-1 text-sm text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {match.city}</span>
              <span className="flex items-center gap-1"><HiTranslate size={14} /> {match.language}</span>
            </div>
          </div>
        </div>
        <MatchProgress score={match.score} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
        <div>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Teaches</p>
          <div className="flex flex-wrap gap-1.5">
            {match.teaches.map(s => (
              <span key={s} className="skill-tag tag-language text-[10px] px-2 py-1">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Wants to learn</p>
          <div className="flex flex-wrap gap-1.5">
            {match.wants.map(s => (
              <span key={s} className="skill-tag tag-coding text-[10px] px-2 py-1">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm font-medium text-[var(--text-muted)] mb-4">
        Credits available: <span className="text-[var(--text-primary)] font-bold">{match.credits}</span>
      </div>

      <div className="flex gap-3 mt-auto">
        <button className="flex-1 btn-primary !py-2.5">
          Send Request
        </button>
        <button className="flex-1 btn-ghost !py-2.5">
          View Profile
        </button>
      </div>
    </motion.div>
  );
}

export default function Matches() {
  const [filter, setFilter] = useState('Best Match');

  return (
    <AppLayout>
      <div className="w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-premium p-4">
          <div className="relative w-full md:w-96">
            <HiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by skill, name, or city..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-2.5 pl-11 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Best Match', 'Near Me'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {STATIC_MATCHES.map((m, idx) => (
            <MatchCard key={m.id} match={m} delay={`${0.1 + idx * 0.05}`} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

