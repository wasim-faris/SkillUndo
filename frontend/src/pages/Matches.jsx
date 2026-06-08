import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { HiBadgeCheck, HiLocationMarker, HiSearch, HiTranslate } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import SessionRequestModal from '../components/sessions/SessionRequestModal';
import { getMatches, getUserSkills } from '../api/skills';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const asArray = (value) => (Array.isArray(value) ? value : []);

function MatchCard({ match, delay, onRequest, onViewProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-premium relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-primary)] hover:shadow-[0_0_15px_rgba(124,111,247,0.15)]"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <Avatar
            firstName={match.name?.split(' ')[0]}
            lastName={match.name?.split(' ')[1]}
            src={match.photo}
            size="xl"
            className="!h-16 !w-16 !rounded-full ring-2 ring-[var(--border-default)] transition-all"
          />
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <h3 className="truncate text-lg font-bold text-[var(--text-primary)]">{match.name}</h3>
              {match?.profile?.is_verified && <HiBadgeCheck className="h-5 w-5 text-[var(--accent-primary)]" />}
            </div>
            <div className="flex flex-col gap-1 text-sm font-medium text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {match.city || 'Location not set'}</span>
              <span className="flex items-center gap-1"><HiTranslate size={14} /> {match.language || 'Language not set'}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Availability</p>
          <div className="flex flex-wrap gap-1.5">
            <span className={`skill-tag px-2 py-1 text-[10px] ${match.is_available ? 'tag-language' : 'tag-design'}`}>
              {match.is_available ? 'Open for swaps' : 'Unavailable'}
            </span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Match Status</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="skill-tag tag-coding px-2 py-1 text-[10px]">Mutual skill overlap detected</span>
          </div>
        </div>
      </div>

      <div className="mb-4 mt-5 text-sm font-medium text-[var(--text-muted)]">
        Credits available: <span className="font-bold text-[var(--text-primary)]">{match?.profile?.credits ?? 0}</span>
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={() => onRequest(match.id)} className="btn-primary flex-1 !py-2.5">
          Send Request
        </button>
        <button onClick={() => onViewProfile(match)} className="btn-ghost flex-1 !py-2.5">
          View Profile
        </button>
      </div>
    </motion.div>
  );
}

export default function Matches() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestReceiverId, setRequestReceiverId] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([getMatches(), getUserSkills()])
      .then(([matchesRes, skillsRes]) => {
        if (!active) return;
        const skills = asArray(unwrap(skillsRes));
        setMatches(asArray(unwrap(matchesRes)));
        setUserSkills(skills);
      })
      .catch(() => {
        if (active) toast.error('Failed to load matches');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return matches;

    return matches.filter((match) => {
      const fields = [
        match.name,
        match.city,
        match.language,
      ].filter(Boolean);

      return fields.some((value) => value.toLowerCase().includes(query));
    });
  }, [matches, search]);

  const openRequestModal = (receiverId = '') => {
    if (!userSkills.some((item) => item?.skill_type === 'teach') || !userSkills.some((item) => item?.skill_type === 'learn')) {
      toast.error('Add at least one teaching and one learning skill first');
      navigate('/skills?tab=teaching&add=1');
      return;
    }

    setRequestReceiverId(receiverId);
    setShowRequestModal(true);
  };

  return (
    <AppLayout>
      <div className="w-full space-y-6">
        <div className="card-premium flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-96">
            <HiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, city, or skill..."
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] py-2.5 pl-11 pr-4 text-sm text-[var(--text-primary)] transition-all focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <button onClick={() => openRequestModal()} className="btn-primary w-full whitespace-nowrap px-5 sm:w-auto">
            New Session Request
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card-premium h-[320px] animate-pulse bg-[var(--bg-card)]" />
            ))}
          </div>
        ) : filteredMatches.length ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredMatches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                delay={0.1 + index * 0.05}
                onRequest={openRequestModal}
                onViewProfile={() => navigate(`/profile/${match.id}`, { state: { selectedMatch: match } })}
              />
            ))}
          </div>
        ) : (
          <div className="card-premium p-12 text-center">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">No matches found</h2>
            <p className="mt-2 text-[var(--text-secondary)]">Add more teaching and learning skills to improve your match pool.</p>
          </div>
        )}
      </div>

      {showRequestModal ? (
        <SessionRequestModal
          key={requestReceiverId || 'new-session-request'}
          isOpen={showRequestModal}
          initialReceiverId={requestReceiverId}
          onClose={() => setShowRequestModal(false)}
        />
      ) : null}
    </AppLayout>
  );
}
